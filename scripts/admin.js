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

async function login() {
	showSpinner();
	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;
	const { error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) loginError.textContent = error.message;
	else {
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

	if (!data.length) {
		productsTableBody.innerHTML = `<tr><td colspan="7">No products found</td></tr>`;
		return;
	}

	data.forEach((p) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
		<td>${p.title}</td>
		<td>${p.description}</td>
		<td>${p.tags.join(", ")}</td>
		<td>${p.price}</td>
		<td>${p.unit || "Not defined"}</td>
		<td>${p.is_best_seller ? "Yes" : "No"}</td>
		<td>${p.show_in_catalogue ? "Yes" : "No"}</td>
		<td>${p.image ? `<img src="${p.image}" />` : ""}</td>
		<td>
			<button class="edit" data-id="${p.id}">Edit</button>
			<button class="delete" data-id="${p.id}">Delete</button>
		</td>`;
		productsTableBody.appendChild(tr);
	});

	document
		.querySelectorAll(".edit")
		.forEach((b) => (b.onclick = () => editProduct(b.dataset.id)));
	document
		.querySelectorAll(".delete")
		.forEach((b) => (b.onclick = () => deleteProduct(b.dataset.id)));
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
		const unit = prodUnit.value.trim() || "pc";

		if (isNaN(price)) return alert("Price required");

		const payload = {
			id,
			title,
			description,
			tags,
			price,
			unit,
			discount,
			is_best_seller: prodBestSeller.checked,
			show_in_catalogue: prodShowCat.checked,
		};

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
	prodUnit.value = data.unit || "pc";
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

// ---------- INIT ----------
checkSession();
