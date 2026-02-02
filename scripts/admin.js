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
const addToQueueBtn = document.getElementById("addToQueueBtn");
const uploadQueueBtn = document.getElementById("uploadQueueBtn");
const queueTableBody = document.querySelector("#queueTable tbody");

// Tabs
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
tabButtons.forEach((btn) => {
	btn.onclick = () => {
		tabButtons.forEach((b) => b.classList.remove("active"));
		tabContents.forEach((c) => c.classList.remove("active"));
		btn.classList.add("active");
		document.getElementById(btn.dataset.tab).classList.add("active");
	};
});

function switchTab(tabId) {
	const tabs = document.querySelectorAll(".tab-btn");
	const contents = document.querySelectorAll(".tab-content");

	tabs.forEach((t) => t.classList.remove("active"));
	contents.forEach((c) => c.classList.remove("active"));

	document
		.querySelector(`.tab-btn[data-tab="${tabId}"]`)
		.classList.add("active");
	document.getElementById(tabId).classList.add("active");
}

// Spinner helpers
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
		await loadProducts();
	} else {
		loginForm.style.display = "block";
		dashboard.style.display = "none";
	}
	hideSpinner();
}

async function login() {
	showSpinner();
	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;
	const { error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) {
		loginError.textContent = error.message;
	} else {
		loginError.textContent = "";
		await checkSession();
	}
	hideSpinner();
}

async function logout() {
	await supabase.auth.signOut();
	checkSession();
}

loginBtn.onclick = login;
logoutBtn.onclick = logout;

// ---------- LOAD ----------
async function loadProducts() {
	const { data, error } = await supabase
		.from("products")
		.select("*")
		.order("created_at", { ascending: false });
	if (error) return alert(error.message);
	productsTableBody.innerHTML = "";
	data.forEach((p) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
			<td>${p.title}</td>
			<td>${p.description}</td>
			<td>${p.tags.join(", ")}</td>
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

// ---------- UPLOAD ----------
async function uploadFile(file, folder) {
	const filePath = `${folder}/${crypto.randomUUID()}_${file.name}`;
	const { error } = await supabase.storage
		.from("product-images")
		.upload(filePath, file, { upsert: true });
	if (error) throw error;
	return supabase.storage.from("product-images").getPublicUrl(filePath).data
		.publicUrl;
}

// ---------- SAVE SINGLE ----------
productForm.onsubmit = async (e) => {
	e.preventDefault();
	showSpinner();
	try {
		const id = productIdInput.value || crypto.randomUUID();
		const title = prodTitle.value;
		const description = prodDesc.value;
		const tags = prodTags.value
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);
		const price = parseFloat(prodPrice.value);
		const discount = parseFloat(prodDiscount.value) || 0;

		if (isNaN(price)) return alert("Price is required");

		let imageUrl = prodMainImg.files.length
			? await uploadFile(prodMainImg.files[0], "main")
			: null;
		let gallery = [];
		for (const f of prodExtraImgs.files)
			gallery.push(await uploadFile(f, "extra"));

		const payload = {
			id,
			title,
			description,
			tags,
			price,
			discount,
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
	} catch (err) {
		alert(err.message);
	}
	hideSpinner();
};

// ---------- EDIT ----------
async function editProduct(id) {
	switchTab("single");

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
	prodBestSeller.checked = data.is_best_seller;
	prodShowCat.checked = data.show_in_catalogue;
	formTitle.textContent = "Edit Product";
}

// ---------- DELETE ----------
async function deleteProduct(id) {
	if (!confirm("Delete this product?")) return;
	await supabase.from("products").delete().eq("id", id);
	loadProducts();
}

// ---------- CANCEL ----------
cancelEditBtn.onclick = () => {
	productForm.reset();
	productIdInput.value = "";
	formTitle.textContent = "Add New Product";
};

// ---------- BATCH QUEUE ----------
let productQueue = [];

addToQueueBtn.onclick = () => {
	const title = batchTitle.value.trim();
	const description = batchDesc.value.trim();
	const tags = batchTags.value
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean);
	const price = parseFloat(batchPrice.value);
	const discount = parseFloat(batchDiscount.value) || 0;
	const mainImg = batchMainImg.files[0];
	const extraImgs = batchExtraImgs.files;

	if (!title || !description || isNaN(price) || !mainImg)
		return alert("Fill all required fields");

	productQueue.push({
		title,
		description,
		tags,
		price,
		discount,
		mainImg,
		extraImgs,
		isBest: batchBestSeller.checked,
		showCat: batchShowCat.checked,
	});
	renderQueue();
	document.getElementById("batchForm").reset();
};

function renderQueue() {
	queueTableBody.innerHTML = "";
	productQueue.forEach((p, index) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
			<td>${p.title}</td>
			<td>${p.description}</td>
			<td>${p.tags.join(", ")}</td>
			<td>${p.price}</td>
			<td>${p.discount}</td>
			<td>${p.isBest ? "Yes" : "No"}</td>
			<td>${p.showCat ? "Yes" : "No"}</td>
			<td>${p.mainImg.name}</td>
			<td><button class="removeQueue" data-index="${index}">Remove</button></td>
		`;
		queueTableBody.appendChild(tr);
	});
	document.querySelectorAll(".removeQueue").forEach((b) => {
		b.onclick = () => {
			productQueue.splice(b.dataset.index, 1);
			renderQueue();
		};
	});
}

uploadQueueBtn.onclick = async () => {
	if (!productQueue.length) return alert("Queue is empty");
	showSpinner();
	try {
		for (const p of productQueue) {
			let mainUrl = await uploadFile(p.mainImg, "main");
			let gallery = [];
			for (const f of p.extraImgs) gallery.push(await uploadFile(f, "extra"));

			const payload = {
				id: crypto.randomUUID(),
				title: p.title,
				description: p.description,
				tags: p.tags,
				price: p.price,
				discount: p.discount,
				is_best_seller: p.isBest,
				show_in_catalogue: p.showCat,
			};
			if (mainUrl) payload.image = mainUrl;
			if (gallery.length) payload.gallery = gallery;

			await supabase.from("products").insert(payload);
		}
		productQueue = [];
		renderQueue();
		loadProducts();
		alert("All products uploaded successfully!");
	} catch (err) {
		alert(err.message);
	}
	hideSpinner();
};

// ---------- INIT ----------
checkSession();
