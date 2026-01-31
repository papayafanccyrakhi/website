fetch("/data/bestsellers.md")
	.then((r) => r.text())
	.then((md) => {
		const blocks = md
			.split("## product")
			.map((b) => b.trim())
			.filter((b) => b.length);

		const products = blocks.map((b) => {
			const obj = {};
			b.split("\n").forEach((line) => {
				const [k, ...v] = line.split(":");
				if (!v.length) return;
				obj[k.trim()] = v.join(":").trim();
			});
			return obj;
		});

		const container = document.getElementById("bestSellers");
		container.innerHTML = "";

		products.forEach((p) => {
			const div = document.createElement("div");
			div.classList.add("product-card");
			div.innerHTML = `
            <div class="card shell-card gold-outlier" onclick='openProduct(${JSON.stringify(
							p,
						)})'>
                <div class="image-wrap">
                    <img src="/${p.image}" alt="${p.title}">
                </div>
                <div class="card-body text-center">
                    <h5 class="product-title">${p.title}</h5>
                </div>
            </div>`;
			container.appendChild(div);
		});

		// Duplicate for seamless scroll
		container.innerHTML += container.innerHTML;

		// Auto scroll
		let speed = 0.5;
		let isUserInteracting = false;

		function autoScroll() {
			if (!isUserInteracting) {
				container.scrollLeft += speed;
				if (container.scrollLeft >= container.scrollWidth / 2) {
					container.scrollLeft =
						(container.scrollLeft + speed) % (container.scrollWidth / 2);
				}
			}
			requestAnimationFrame(autoScroll);
		}
		autoScroll();

		// Drag to scroll
		let isDown = false;
		let startX;
		let scrollLeft;

		container.addEventListener(
			"mousedown",
			(e) => {
				isDown = true;
				isUserInteracting = true;
				container.classList.add("active");
				startX = e.pageX - container.offsetLeft;
				scrollLeft = container.scrollLeft;
			},
			{ passive: true },
		);
		container.addEventListener(
			"mouseleave",
			() => {
				isDown = false;
				isUserInteracting = false;
				container.classList.remove("active");
			},
			{ passive: true },
		);
		container.addEventListener(
			"mouseup",
			() => {
				isDown = false;
				isUserInteracting = false;
				container.classList.remove("active");
			},
			{ passive: true },
		);
		container.addEventListener(
			"mousemove",
			(e) => {
				if (!isDown) return;
				e.preventDefault();
				const x = e.pageX - container.offsetLeft;
				const walk = (x - startX) * 2; // scroll-fast
				container.scrollLeft = scrollLeft - walk;
			},
			{ passive: false }, // must be false because we call preventDefault
		);

		// Touch events for mobile
		let startTouchX = 0;
		let scrollStart = 0;

		container.addEventListener(
			"touchstart",
			(e) => {
				isUserInteracting = true;
				startTouchX = e.touches[0].pageX;
				scrollStart = container.scrollLeft;
			},
			{ passive: true },
		);

		container.addEventListener(
			"touchmove",
			(e) => {
				const x = e.touches[0].pageX;
				const walk = (x - startTouchX) * 2;
				container.scrollLeft = scrollStart - walk;
			},
			{ passive: true },
		);

		container.addEventListener(
			"touchend",
			() => {
				isUserInteracting = false;
			},
			{ passive: true },
		);
	});

function openProduct(p) {
	localStorage.setItem("selectedProduct", JSON.stringify(p));
	window.location.href = "/product.html";
}
