// Load and parse state visit data
let stateData = {};

async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        // Convert array to object for easier lookup
        data.states.forEach(state => {
            stateData[state.name.toLowerCase()] = state.visits;
        });
        
        updateStats();
        createMap();
        populateStateList();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('mapContainer').innerHTML = '<p style="color: red; text-align: center;">Error loading data. Make sure data.json is in the same directory.</p>';
    }
}

function updateStats() {
    const visitedStates = Object.values(stateData).filter(v => v > 0).length;
    const totalVisits = Object.values(stateData).reduce((a, b) => a + b, 0);
    const totalStates = Object.keys(stateData).length;
    const percentVisited = Math.round((visitedStates / totalStates) * 100);
    
    document.getElementById('totalStates').textContent = visitedStates;
    document.getElementById('totalVisits').textContent = totalVisits;
    document.getElementById('percentVisited').textContent = percentVisited + '%';
}

function createMap() {
    // Fetch US map SVG from CDN
    fetch('https://d3js.org/us-states-10m.json')
        .then(response => response.json())
        .then(data => {
            // Create a simplified map using canvas or SVG
            createSimplifiedMap();
        })
        .catch(error => {
            console.error('Error fetching map:', error);
            createSimplifiedMap();
        });
}

function createSimplifiedMap() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1000 600');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', 'auto');
    svg.style.maxWidth = '1000px';
    
    // Create a grid-based simplified US map (state names displayed)
    const statePositions = getStatePositions();
    
    // Create state rectangles
    statePositions.forEach(state => {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', state.x);
        rect.setAttribute('y', state.y);
        rect.setAttribute('width', state.width);
        rect.setAttribute('height', state.height);
        rect.setAttribute('class', `state ${getStateClass(state.name)}`);
        rect.setAttribute('data-state', state.name);
        
        const visits = stateData[state.name.toLowerCase()] || 0;
        rect.setAttribute('data-visits', visits);
        rect.setAttribute('stroke', '#999');
        rect.setAttribute('stroke-width', '1');
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', parseFloat(state.x) + parseFloat(state.width) / 2);
        text.setAttribute('y', parseFloat(state.y) + parseFloat(state.height) / 2);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '10');
        text.setAttribute('pointer-events', 'none');
        text.setAttribute('fill', '#333');
        text.setAttribute('font-weight', 'bold');
        
        const abbr = getStateAbbreviation(state.name);
        text.textContent = abbr;
        
        group.appendChild(rect);
        group.appendChild(text);
        svg.appendChild(group);
        
        // Add tooltip
        rect.addEventListener('mouseover', (e) => {
            rect.style.cursor = 'pointer';
            rect.style.strokeWidth = '2';
            rect.style.filter = 'brightness(1.1)';
        });
        rect.addEventListener('mouseout', (e) => {
            rect.style.strokeWidth = '1';
            rect.style.filter = 'none';
        });
        rect.addEventListener('click', () => {
            showStateInfo(state.name, visits);
        });
    });
    
    document.getElementById('mapContainer').innerHTML = '';
    document.getElementById('mapContainer').appendChild(svg);
}

function getStateClass(stateName) {
    const visits = stateData[stateName.toLowerCase()] || 0;
    if (visits === 0) return 'unvisited';
    if (visits === 1) return 'visited-1';
    if (visits === 2) return 'visited-2';
    if (visits === 3) return 'visited-3';
    return 'visited-4plus';
}

function getStateAbbreviation(name) {
    const abbreviations = {
        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
        'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
        'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
        'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
        'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
        'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
        'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
        'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
        'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
        'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
        'District of Columbia': 'DC'
    };
    return abbreviations[name] || name.substring(0, 2).toUpperCase();
}

function getStatePositions() {
    // Simplified grid-based positions (approximate US map layout)
    return [
        // Row 1 (Far North)
        { name: 'Alaska', x: 10, y: 480, width: 80, height: 80 },
        { name: 'Hawaii', x: 110, y: 500, width: 50, height: 50 },
        
        // Row 2 (Top row - Washington, Montana, North Dakota, Minnesota, Wisconsin, Michigan, Vermont, New Hampshire, Maine)
        { name: 'Washington', x: 50, y: 50, width: 70, height: 50 },
        { name: 'Montana', x: 140, y: 50, width: 100, height: 60 },
        { name: 'North Dakota', x: 250, y: 50, width: 70, height: 50 },
        { name: 'Minnesota', x: 330, y: 50, width: 70, height: 60 },
        { name: 'Wisconsin', x: 410, y: 50, width: 60, height: 80 },
        { name: 'Michigan', x: 480, y: 50, width: 60, height: 80 },
        { name: 'Vermont', x: 580, y: 50, width: 40, height: 50 },
        { name: 'New Hampshire', x: 630, y: 50, width: 40, height: 50 },
        { name: 'Maine', x: 680, y: 30, width: 50, height: 70 },
        
        // Row 3 (Oregon, Idaho, Wyoming, South Dakota, Iowa, Illinois, Indiana, Ohio, Pennsylvania, New York, Massachusetts, Connecticut, Rhode Island)
        { name: 'Oregon', x: 30, y: 120, width: 70, height: 80 },
        { name: 'Idaho', x: 110, y: 120, width: 70, height: 80 },
        { name: 'Wyoming', x: 190, y: 120, width: 80, height: 70 },
        { name: 'South Dakota', x: 280, y: 120, width: 70, height: 60 },
        { name: 'Iowa', x: 360, y: 140, width: 60, height: 60 },
        { name: 'Illinois', x: 420, y: 140, width: 50, height: 70 },
        { name: 'Indiana', x: 480, y: 140, width: 45, height: 60 },
        { name: 'Ohio', x: 530, y: 140, width: 50, height: 70 },
        { name: 'Pennsylvania', x: 590, y: 140, width: 50, height: 70 },
        { name: 'New York', x: 650, y: 120, width: 50, height: 80 },
        { name: 'Massachusetts', x: 710, y: 120, width: 35, height: 40 },
        { name: 'Connecticut', x: 760, y: 140, width: 30, height: 30 },
        { name: 'Rhode Island', x: 795, y: 145, width: 20, height: 20 },
        
        // Row 4 (Nevada, Utah, Colorado, Nebraska, Missouri, Kentucky, West Virginia, Virginia, Maryland, Delaware, New Jersey)
        { name: 'Nevada', x: 50, y: 210, width: 80, height: 80 },
        { name: 'Utah', x: 140, y: 210, width: 70, height: 70 },
        { name: 'Colorado', x: 220, y: 210, width: 70, height: 70 },
        { name: 'Nebraska', x: 300, y: 210, width: 80, height: 70 },
        { name: 'Missouri', x: 390, y: 220, width: 60, height: 80 },
        { name: 'Kentucky', x: 470, y: 220, width: 60, height: 60 },
        { name: 'West Virginia', x: 540, y: 220, width: 45, height: 60 },
        { name: 'Virginia', x: 590, y: 220, width: 50, height: 80 },
        { name: 'Maryland', x: 650, y: 220, width: 35, height: 45 },
        { name: 'Delaware', x: 690, y: 240, width: 25, height: 30 },
        { name: 'New Jersey', x: 725, y: 230, width: 35, height: 50 },
        
        // Row 5 (California, Arizona, New Mexico, Oklahoma, Kansas, Arkansas, Tennessee, North Carolina, South Carolina)
        { name: 'California', x: 20, y: 310, width: 90, height: 100 },
        { name: 'Arizona', x: 120, y: 310, width: 70, height: 90 },
        { name: 'New Mexico', x: 200, y: 310, width: 70, height: 90 },
        { name: 'Oklahoma', x: 280, y: 320, width: 70, height: 70 },
        { name: 'Kansas', x: 360, y: 310, width: 70, height: 70 },
        { name: 'Arkansas', x: 440, y: 310, width: 60, height: 70 },
        { name: 'Tennessee', x: 510, y: 310, width: 70, height: 50 },
        { name: 'North Carolina', x: 590, y: 310, width: 70, height: 70 },
        { name: 'South Carolina', x: 670, y: 330, width: 60, height: 60 },
        
        // Row 6 (Texas, Louisiana, Mississippi, Alabama, Georgia, Florida)
        { name: 'Texas', x: 240, y: 410, width: 110, height: 100 },
        { name: 'Louisiana', x: 380, y: 420, width: 60, height: 70 },
        { name: 'Mississippi', x: 450, y: 400, width: 50, height: 80 },
        { name: 'Alabama', x: 510, y: 410, width: 50, height: 70 },
        { name: 'Georgia', x: 570, y: 410, width: 60, height: 70 },
        { name: 'Florida', x: 640, y: 410, width: 60, height: 100 },
        
        // District of Columbia (small, near Maryland)
        { name: 'District of Columbia', x: 655, y: 260, width: 15, height: 15 }
    ];
}

function populateStateList() {
    const stateList = document.getElementById('stateList');
    const visitedStates = [];
    
    for (const [state, visits] of Object.entries(stateData)) {
        if (visits > 0) {
            visitedStates.push({ state, visits });
        }
    }
    
    // Sort by visits (descending) then by name
    visitedStates.sort((a, b) => {
        if (b.visits !== a.visits) return b.visits - a.visits;
        return a.state.localeCompare(b.state);
    });
    
    if (visitedStates.length === 0) {
        stateList.innerHTML = '<p style="text-align: center; color: #999; grid-column: 1/-1;">No states visited yet. Start updating data.json!</p>';
        return;
    }
    
    stateList.innerHTML = visitedStates.map(item => `
        <div class="state-card">
            <div class="state-card-name">${item.state}</div>
            <div class="state-card-visits">✓ ${item.visits} visit${item.visits > 1 ? 's' : ''}</div>
        </div>
    `).join('');
}

function showStateInfo(stateName, visits) {
    // Could add a modal here for more details
    console.log(`Clicked: ${stateName} (${visits} visits)`);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadData);
