supabase = window.supabase.createClient(SUPA_URL, SUPA_PUBLIC_KEY);

function showLoader() {
	document.getElementById("loader").classList.remove("hidden");
}
function hideLoader() {
	document.getElementById("loader").classList.add("hidden");
}

async function loadCatalogue() {
	showLoader();

	const localData = localStorage.getItem("catalogueProducts");
	const localTimestamps = localStorage.getItem("catalogueTimestamps");

	let localProducts = JSON.parse(localData || "[]");
	let localTimestampsParsed = JSON.parse(localTimestamps || "{}");

	// 1. Get live product ids
	const { data: productsMeta, error: metaError } = await supabase
		.from("products")
		.select("id, updated_at")
		.eq("show_in_catalogue", true);

	if (metaError) {
		hideLoader();
		return;
	}

	// If database is empty, hard reset cache
	if (!productsMeta || productsMeta.length === 0) {
		localStorage.removeItem("catalogueProducts");
		localStorage.removeItem("catalogueTimestamps");

		const container = document.getElementById("catalogue");
		container.innerHTML = `<div class="empty-state">No products are listed.</div>`;
		hideLoader();
		return;
	}

	const liveIds = new Set();
	const changedIds = [];

	for (const p of productsMeta) {
		liveIds.add(p.id);

		if (
			!localTimestampsParsed[p.id] ||
			localTimestampsParsed[p.id] !== p.updated_at
		) {
			changedIds.push(p.id);
		}
	}

	// 2. Remove deleted products from cache
	localProducts = localProducts.filter((p) => liveIds.has(p.id));

	// 3. Fetch only changed products
	let updatedProducts = [];
	if (changedIds.length > 0) {
		const { data, error } = await supabase
			.from("products")
			.select(
				"id,title,description,image,gallery,tags,price,discount,updated_at,is_best_seller,unit",
			)
			.in("id", changedIds);

		if (error) {
			hideLoader();
			return;
		}

		updatedProducts = data.map((p) => {
			const discount = p.discount || 0;
			const old =
				discount > 0 && discount < 100
					? Math.round(p.price / (1 - discount / 100))
					: 0;

			return { ...p, old, discount };
		});
	}

	// 4. Merge
	const productMap = new Map(localProducts.map((p) => [p.id, p]));

	updatedProducts.forEach((p) => {
		productMap.set(p.id, p);
		localTimestampsParsed[p.id] = p.updated_at;
	});

	const catalogueProducts = Array.from(productMap.values());

	// 5. Save
	localStorage.setItem("catalogueProducts", JSON.stringify(catalogueProducts));
	localStorage.setItem(
		"catalogueTimestamps",
		JSON.stringify(localTimestampsParsed),
	);

	// 6. Render
	const container = document.getElementById("catalogue");
	container.innerHTML = "";

	if (catalogueProducts.length === 0) {
		container.innerHTML = `<div class="empty-state">No products are listed.</div>`;
		hideLoader();
		return;
	}

	catalogueProducts.forEach((p) => {
		const div = document.createElement("div");
		div.className = "col-6 col-md-4 col-lg-3 col-xl-2";

		div.innerHTML = `
        <div class="card product-card h-100">
            <img src="${p.image}">
            <div class="card-body text-center">
                <div class="product-title">${p.title}</div>
				<div class="price">Rs ${p.price} / ${p.unit || "pc"}</div>
            </div>
        </div>`;

		div.onclick = () => {
			location.href = "/product#id=" + p.id;
		};

		container.appendChild(div);
	});

	hideLoader();
}

loadCatalogue();
