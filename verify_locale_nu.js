const date = new Date('2024-02-28T00:00:00');
console.log("Time (km-KH, nu-khmer):", date.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', numberingSystem: 'khmer' }));
