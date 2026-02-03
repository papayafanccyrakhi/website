// Initialize Supabase
supabase = window.supabase.createClient(SUPA_URL, SUPA_PUBLIC_KEY);

// DOM
const loginForm = document.getElementById("loginForm");
const dashboard = document.getElementById("dashboard");
const loginError = document.getElementById("loginError");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const productsTableBody = document.querySelector("#productsTable tbody");
const productForm = document.getElementById("productForm");
const formTitle = document.getElementById("formTitle");
const cancelEditBtn = document.getElementById("cancelEdit");
const spinner = document.getElementById("spinner");
const adminDisclaimer = document.getElementById("adminDisclaimer");

// Inputs - single
const productIdInput = document.getElementById("productId");
const prodTitle = document.getElementById("prodTitle");
const prodDesc = document.getElementById("prodDesc");
const prodTags = document.getElementById("prodTags");
const prodMainImg = document.getElementById("prodMainImg");
const prodExtraImgs = document.getElementById("prodExtraImgs");
const prodBestSeller = document.getElementById("prodBestSeller");
const prodShowCat = document.getElementById("prodShowCat");
const prodPrice = document.getElementById("prodPrice");
const prodDiscount = document.getElementById("prodDiscount");
const prodUnit = document.getElementById("prodUnit");

// Inputs - batch
const batchTitle = document.getElementById("batchTitle");
const batchDesc = document.getElementById("batchDesc");
const batchTags = document.getElementById("batchTags");
const batchMainImg = document.getElementById("batchMainImg");
const batchExtraImgs = document.getElementById("batchExtraImgs");
const batchPrice = document.getElementById("batchPrice");
const batchDiscount = document.getElementById("batchDiscount");
const batchBestSeller = document.getElementById("batchBestSeller");
const batchShowCat = document.getElementById("batchShowCat");
const batchUnit = document.getElementById("batchUnit");
const addToQueueBtn = document.getElementById("addToQueueBtn");
const uploadQueueBtn = document.getElementById("uploadQueueBtn");
const queueTableBody = document.querySelector("#queueTable tbody");

// Spinner
function showSpinner() {
	spinner.classList.remove("hidden");
	productForm.querySelector("button[type=submit]").disabled = true;
}
function hideSpinner() {
	spinner.classList.add("hidden");
	productForm.querySelector("button[type=submit]").disabled = false;
}

// ---------- AUTH ----------
async function checkSession() {
	showSpinner();
	const { data } = await supabase.auth.getSession();
	if (data.session) {
		loginForm.style.display = "none";
		dashboard.style.display = "block";
		if (adminDisclaimer) adminDisclaimer.style.display = "none";
		await loadProducts();
	} else {
		loginForm.style.display = "block";
		dashboard.style.display = "none";
		if (adminDisclaimer) adminDisclaimer.style.display = "block";
	}
	hideSpinner();
}

loginBtn.onclick = async () => {
	showSpinner();
	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;
	const { error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) loginError.textContent = error.message;
	else await checkSession();
	hideSpinner();
};

logoutBtn.onclick = async () => {
	await supabase.auth.signOut();
	checkSession();
};

// ---------- LOAD ----------
async function loadProducts() {
	const { data, error } = await supabase
		.from("products")
		.select("*")
		.order("created_at", { ascending: false });
	if (error) return alert(error.message);

	productsTableBody.innerHTML = "";
	if (!data.length) {
		productsTableBody.innerHTML = `<tr><td colspan="9">No products found</td></tr>`;
		return;
	}

	data.forEach((p) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
			<td>${p.title}</td>
			<td>${p.description}</td>
			<td>${p.tags.join(", ")}</td>
			<td>${p.price} ${p.unit || "pc"}</td>
			<td>${p.is_best_seller ? "Yes" : "No"}</td>
			<td>${p.show_in_catalogue ? "Yes" : "No"}</td>
			<td>${p.image ? `<img src="${p.image}" />` : ""}</td>
			<td>
				<button class="edit" data-id="${p.id}">Edit</button>
				<button class="delete" data-id="${p.id}">Delete</button>
			</td>
		`;
		productsTableBody.appendChild(tr);
	});

	document
		.querySelectorAll(".edit")
		.forEach((b) => (b.onclick = () => editProduct(b.dataset.id)));
	document
		.querySelectorAll(".delete")
		.forEach((b) => (b.onclick = () => deleteProduct(b.dataset.id)));
}

// ---------- STORAGE ----------
async function uploadFile(file, folder) {
	const path = `${folder}/${crypto.randomUUID()}_${file.name}`;
	const { error } = await supabase.storage
		.from("product-images")
		.upload(path, file, { upsert: true });
	if (error) throw error;
	return supabase.storage.from("product-images").getPublicUrl(path).data
		.publicUrl;
}

// ---------- SAVE SINGLE ----------
productForm.onsubmit = async (e) => {
	e.preventDefault();
	showSpinner();
	try {
		const id = productIdInput.value || crypto.randomUUID();
		const price = parseFloat(prodPrice.value);
		if (isNaN(price)) throw new Error("Price required");

		let imageUrl = null;
		let gallery = [];

		if (prodMainImg.files.length)
			imageUrl = await uploadFile(prodMainImg.files[0], "main");
		if (prodExtraImgs.files.length) {
			for (const f of prodExtraImgs.files)
				gallery.push(await uploadFile(f, "extra"));
		}

		const payload = {
			id,
			title: prodTitle.value,
			description: prodDesc.value,
			tags: prodTags.value
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean),
			price,
			unit: prodUnit.value.trim() || "pc",
			discount: parseFloat(prodDiscount.value) || 0,
			is_best_seller: prodBestSeller.checked,
			show_in_catalogue: prodShowCat.checked,
		};

		if (imageUrl) payload.image = imageUrl;
		if (gallery.length) payload.gallery = gallery;

		const { error } = productIdInput.value
			? await supabase.from("products").update(payload).eq("id", id)
			: await supabase.from("products").insert(payload);

		if (error) throw error;

		productForm.reset();
		productIdInput.value = "";
		formTitle.textContent = "Add New Product";
		loadProducts();
	} catch (e) {
		alert(e.message);
	}
	hideSpinner();
};

// ---------- EDIT ----------
async function editProduct(id) {
	const { data } = await supabase
		.from("products")
		.select("*")
		.eq("id", id)
		.single();
	productIdInput.value = data.id;
	prodTitle.value = data.title;
	prodDesc.value = data.description;
	prodTags.value = data.tags.join(", ");
	prodPrice.value = data.price;
	prodDiscount.value = data.discount || 0;
	prodUnit.value = data.unit || "pc";
	prodBestSeller.checked = data.is_best_seller;
	prodShowCat.checked = data.show_in_catalogue;
	formTitle.textContent = "Edit Product";
}

// ---------- DELETE ----------
async function deleteProduct(id) {
	if (!confirm("Delete?")) return;
	await supabase.from("products").delete().eq("id", id);
	loadProducts();
}

// ---------- BATCH ----------
let productQueue = [];

addToQueueBtn.onclick = () => {
	const price = parseFloat(batchPrice.value);
	if (isNaN(price) || !batchMainImg.files[0]) return alert("Missing data");

	productQueue.push({
		title: batchTitle.value,
		description: batchDesc.value,
		tags: batchTags.value
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean),
		price,
		unit: batchUnit.value.trim() || "pc",
		discount: parseFloat(batchDiscount.value) || 0,
		mainImg: batchMainImg.files[0],
		extraImgs: batchExtraImgs.files,
		isBest: batchBestSeller.checked,
		showCat: batchShowCat.checked,
	});
	renderQueue();
	document.getElementById("batchForm").reset();
};

function renderQueue() {
	queueTableBody.innerHTML = "";
	productQueue.forEach((p, i) => {
		queueTableBody.innerHTML += `
			<tr>
				<td>${p.title}</td>
				<td>${p.price} ${p.unit}</td>
				<td>${p.mainImg.name}</td>
				<td><button onclick="productQueue.splice(${i},1);renderQueue()">Remove</button></td>
			</tr>
		`;
	});
}

uploadQueueBtn.onclick = async () => {
	showSpinner();
	try {
		for (const p of productQueue) {
			const image = await uploadFile(p.mainImg, "main");
			const gallery = [];
			for (const f of p.extraImgs) gallery.push(await uploadFile(f, "extra"));

			await supabase.from("products").insert({
				id: crypto.randomUUID(),
				title: p.title,
				description: p.description,
				tags: p.tags,
				price: p.price,
				unit: p.unit,
				discount: p.discount,
				is_best_seller: p.isBest,
				show_in_catalogue: p.showCat,
				image,
				gallery,
			});
		}
		productQueue = [];
		renderQueue();
		loadProducts();
		alert("Uploaded");
	} catch (e) {
		alert(e.message);
	}
	hideSpinner();
};

// ---------- INIT ----------
checkSession();
