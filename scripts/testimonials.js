const testimonials = [
	{
		name: "Ananya Sharma, Delhi",
		text: "Absolutely beautiful Rakhi. The quality feels premium and delivery was fast.",
		stars: 5,
		img: "https://randomuser.me/api/portraits/women/44.jpg",
	},
	{
		name: "Rohit Mehta, Mumbai",
		text: "My brother loved it. Looks even better than the photos. Worth the price.",
		stars: 5,
		img: "https://randomuser.me/api/portraits/men/32.jpg",
	},
	{
		name: "Sneha Patel, Ahmedabad",
		text: "Very elegant design. Packaging was also really nice. Will order again.",
		stars: 4,
		img: "https://randomuser.me/api/portraits/women/68.jpg",
	},
	{
		name: "Amit Roy, Kolkata",
		text: "Good quality Rakhi and quick delivery. Happy with the service.",
		stars: 5,
		img: "https://randomuser.me/api/portraits/men/75.jpg",
	},
	{
		name: "Priya Verma, Jaipur",
		text: "Design was really nice and the thread quality was strong. Slight delay in delivery but worth it.",
		stars: 4,
		img: "https://randomuser.me/api/portraits/women/12.jpg",
	},
	{
		name: "Karan Singh, Chandigarh",
		text: "Good looking Rakhi and decent packaging. My brother liked it.",
		stars: 4,
		img: "https://randomuser.me/api/portraits/men/21.jpg",
	},
	{
		name: "Neha Gupta, Noida",
		text: "The Rakhi was beautiful and exactly as shown. Would definitely recommend.",
		stars: 5,
		img: "https://randomuser.me/api/portraits/women/37.jpg",
	},
	{
		name: "Vikas Malhotra, Ludhiana",
		text: "Quality is good for the price. Could improve the box but Rakhi itself is great.",
		stars: 3,
		img: "https://randomuser.me/api/portraits/men/41.jpg",
	},
	{
		name: "Ritu Saxena, Indore",
		text: "Loved the finishing and colors. It looked very premium.",
		stars: 5,
		img: "https://randomuser.me/api/portraits/women/53.jpg",
	},
	{
		name: "Saurabh Tiwari, Prayagraj",
		text: "Nice Rakhi and decent price. Delivery was on time.",
		stars: 4,
		img: "https://randomuser.me/api/portraits/men/56.jpg",
	},
	{
		name: "Megha Kulkarni, Pune",
		text: "The Rakhi was pretty and well packed. Slightly smaller than expected.",
		stars: 3,
		img: "https://randomuser.me/api/portraits/women/24.jpg",
	},
	{
		name: "Rakesh Yadav, Kanpur",
		text: "Strong thread and good design. My brother was happy.",
		stars: 4,
		img: "https://randomuser.me/api/portraits/men/63.jpg",
	},
];

let index = 0;
let charIndex = 0;

const textEl = document.getElementById("testimonialText");
const nameEl = document.getElementById("testimonialName");
const avatarEl = document.getElementById("testimonialAvatar");
const starsEl = document.getElementById("testimonialStars");

function showStars(count) {
	starsEl.innerHTML = "★".repeat(count) + "☆".repeat(5 - count);
}

function typeText(text, i = 0) {
	if (i < text.length) {
		textEl.textContent += text.charAt(i);
		setTimeout(() => typeText(text, i + 1), 40);
	}
}

function showTestimonial() {
	const t = testimonials[index];

	textEl.textContent = "";
	nameEl.textContent = t.name;
	avatarEl.src = t.img;
	showStars(t.stars);

	typeText(t.text);

	index = (index + 1) % testimonials.length;
}

showTestimonial();
setInterval(showTestimonial, 10000);
