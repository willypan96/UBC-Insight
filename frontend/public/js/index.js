let c1 = getComputedStyle(document.documentElement).getPropertyValue('--c1');
let c2 = getComputedStyle(document.documentElement).getPropertyValue('--c2');

console.log(Number(`0x${c2.substring(1)}`))


VANTA.NET({
	el: ".ubc-insight-title",
	mouseControls: true,
	touchControls: false,
	gyroControls: false,
	scale: 1.00,
	scaleMobile: 1.00,
	color: Number(`0x${c2.substring(1)}`),
	backgroundColor: Number(`0x${c1.substring(1)}`),
	points: 12.00,
	maxDistance: 25.00,
	spacing: 16.00
})
