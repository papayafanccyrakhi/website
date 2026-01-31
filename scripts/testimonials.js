const testimonials = [
	{
		name: "Ananya Sharma, Delhi",
		text: "Absolutely beautiful Rakhi. The quality feels premium and delivery was fast.",
		stars: 5,
		img: "https://ui-avatars.com/api/?name=Ananya+Sharma&background=ffd166&color=000&size=128",
	},
	{
		name: "Rohit Mehta, Mumbai",
		text: "My brother loved it. Looks even better than the photos. Worth the price.",
		stars: 5,
		img: "https://ui-avatars.com/api/?name=Rohit+Mehta&background=ef476f&color=fff&size=128",
	},
	{
		name: "Sneha Patel, Ahmedabad",
		text: "Very elegant design. Packaging was also really nice. Will order again.",
		stars: 4,
		img: "https://ui-avatars.com/api/?name=Sneha+Patel&background=06d6a0&color=000&size=128",
	},
	{
		name: "Amit Roy, Kolkata",
		text: "Good quality Rakhi and quick delivery. Happy with the service.",
		stars: 5,
		img: "https://ui-avatars.com/api/?name=Amit+Roy&background=118ab2&color=fff&size=128",
	},
	{
		name: "Priya Verma, Jaipur",
		text: "Design was really nice and the thread quality was strong. Slight delay in delivery but worth it.",
		stars: 4,
		img: "https://ui-avatars.com/api/?name=Priya+Verma&background=ffd166&color=000&size=128",
	},
	{
		name: "Karan Singh, Chandigarh",
		text: "Good looking Rakhi and decent packaging. My brother liked it.",
		stars: 4,
		img: "https://ui-avatars.com/api/?name=Karan+Singh&background=ef476f&color=fff&size=128",
	},
	{
		name: "Neha Gupta, Noida",
		text: "The Rakhi was beautiful and exactly as shown. Would definitely recommend.",
		stars: 5,
		img: "https://ui-avatars.com/api/?name=Neha+Gupta&background=06d6a0&color=000&size=128",
	},
];

const textEl = document.getElementById("testimonialText");
const nameEl = document.getElementById("testimonialName");
const avatarEl = document.getElementById("testimonialAvatar");
const starsEl = document.getElementById("testimonialStars");

let index = 0;
let typingTimeout = null;
let cycleInterval = null;
let running = false;

function showStars(count) {
	starsEl.textContent = "★".repeat(count) + "☆".repeat(5 - count);
}

function typeText(text, i = 0) {
	if (i === 0) textEl.textContent = "";
	if (i < text.length) {
		textEl.textContent += text.charAt(i);
		typingTimeout = setTimeout(() => typeText(text, i + 1), 40);
	}
}

function showTestimonial() {
	const t = testimonials[index];
	clearTimeout(typingTimeout);

	nameEl.textContent = t.name;
	avatarEl.src = t.img;
	showStars(t.stars);
	typeText(t.text);

	index = (index + 1) % testimonials.length;
}

function startTestimonials() {
	if (running) return;
	running = true;
	showTestimonial();
	cycleInterval = setInterval(showTestimonial, 10000);
}

function stopTestimonials() {
	running = false;
	clearInterval(cycleInterval);
	clearTimeout(typingTimeout);
}

document.addEventListener("visibilitychange", () => {
	document.hidden ? stopTestimonials() : startTestimonials();
});

startTestimonials();
