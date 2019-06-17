function ordinal (n) {
    var n = Number(n),
        suffixes = ["th","st","nd","rd"],
        value = n % 100,
        suffix = suffixes[ (value-20) % 10 ] || suffixes[value] || suffixes[0];
    return String(n) + suffix;
}

module.exports = data => {
    
    var div = document.createElement('div');
    
    div.classList.add('tower__wall');
    
    // var floor = String(data.floor);
    // var floors = floor.split('/')
    // var s = floors.length > 1 ? 'S' : '';
    // floors = floors.map(ordinal).join('/');
    
    div.innerHTML = `
        <p>${data.floor} – ${data.status}</p>
        <h1>${data.name}</h1>
        <p>${data.info}</p>
    `;
    
    return div;
    
}