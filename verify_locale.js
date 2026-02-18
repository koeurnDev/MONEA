const date = new Date('2024-02-28T00:00:00');
console.log("Date (km-KH):", date.toLocaleDateString('km-KH', { month: 'long' }));
console.log("Time (km-KH):", date.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' }));
