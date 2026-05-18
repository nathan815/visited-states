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

function getStateClass(stateName) {
    const visits = stateData[stateName.toLowerCase()] || 0;
    if (visits === 0) return 'unvisited';
    if (visits === 1) return 'visited-1';
    if (visits === 2) return 'visited-2';
    if (visits === 3) return 'visited-3';
    return 'visited-4plus';
}

function createMap() {
    // Load US TopoJSON from CDN
    d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(us => {
        // Extract states from TopoJSON
        const states = topojson.feature(us, us.objects.states).features;
        
        // Calculate bounds
        const margin = { top: 20, right: 60, bottom: 20, left: 60 };
        const width = Math.min(1200, window.innerWidth - 100);
        const height = width * 0.6;
        
        // Create projection
        const projection = d3.geoAlbersUsa()
            .fitSize([width, height], topojson.feature(us, us.objects.states));
        
        const path = d3.geoPath(projection);
        
        // Create SVG
        const svg = d3.select('#mapContainer')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height]);
        
        // State name mapping (FIPS ID to state name)
        const stateNames = {
            '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas', '06': 'California',
            '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware', '12': 'Florida', '13': 'Georgia',
            '15': 'Hawaii', '16': 'Idaho', '17': 'Illinois', '18': 'Indiana', '19': 'Iowa',
            '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine', '24': 'Maryland',
            '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota', '28': 'Mississippi', '29': 'Missouri',
            '30': 'Montana', '31': 'Nebraska', '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey',
            '35': 'New Mexico', '36': 'New York', '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio',
            '40': 'Oklahoma', '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island', '45': 'South Carolina',
            '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas', '49': 'Utah', '50': 'Vermont',
            '51': 'Virginia', '53': 'Washington', '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming',
            '11': 'District of Columbia'
        };

        // State abbreviations
        const stateAbbreviations = {
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
        
        // Draw states
        svg.selectAll('.state')
            .data(states)
            .enter()
            .append('path')
            .attr('class', d => {
                const stateName = stateNames[d.id.padStart(2, '0')] || 'Unknown';
                return `state ${getStateClass(stateName)}`;
            })
            .attr('d', path)
            .attr('data-state', d => {
                const stateName = stateNames[d.id.padStart(2, '0')] || 'Unknown';
                const visits = stateData[stateName.toLowerCase()] || 0;
                return `${stateName} (${visits})`;
            })
            .on('mouseover', function(event, d) {
                const stateName = stateNames[d.id.padStart(2, '0')] || 'Unknown';
                const visits = stateData[stateName.toLowerCase()] || 0;
                const visitText = visits === 0 ? 'Not visited' : `${visits} visit${visits > 1 ? 's' : ''}`;
                
                const tooltip = document.getElementById('tooltip');
                tooltip.textContent = `${stateName}: ${visitText}`;
                tooltip.style.display = 'block';
                tooltip.style.left = (event.pageX + 10) + 'px';
                tooltip.style.top = (event.pageY + 10) + 'px';
                
                d3.select(this)
                    .style('stroke-width', 1.5)
                    .style('filter', 'brightness(0.95)');
            })
            .on('mousemove', function(event, d) {
                const tooltip = document.getElementById('tooltip');
                tooltip.style.left = (event.pageX + 10) + 'px';
                tooltip.style.top = (event.pageY + 10) + 'px';
            })
            .on('mouseout', function(event, d) {
                document.getElementById('tooltip').style.display = 'none';
                d3.select(this)
                    .style('stroke-width', 0.5)
                    .style('filter', 'none');
            })
            .on('click', function(event, d) {
                const stateName = stateNames[d.id.padStart(2, '0')] || 'Unknown';
                const visits = stateData[stateName.toLowerCase()] || 0;
                alert(`${stateName}: ${visits} visit${visits > 1 ? 's' : ''}`);
            });

        // Calculate state sizes to determine which are small
        const stateAreas = states.map(d => {
            const bounds = path.bounds(d);
            const area = (bounds[1][0] - bounds[0][0]) * (bounds[1][1] - bounds[0][1]);
            return { d, area };
        });
        const medianArea = stateAreas.sort((a, b) => a.area - b.area)[Math.floor(stateAreas.length / 2)].area;
        const smallStateThreshold = medianArea * 0.35;
        
        // Add state abbreviation labels (inside states)
        svg.selectAll('.state-label-inside')
            .data(states.filter(d => {
                const bounds = path.bounds(d);
                const area = (bounds[1][0] - bounds[0][0]) * (bounds[1][1] - bounds[0][1]);
                return area >= smallStateThreshold;
            }))
            .enter()
            .append('text')
            .attr('class', 'state-label')
            .attr('x', d => {
                const bounds = path.bounds(d);
                return (bounds[0][0] + bounds[1][0]) / 2;
            })
            .attr('y', d => {
                const bounds = path.bounds(d);
                return (bounds[0][1] + bounds[1][1]) / 2;
            })
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', width < 600 ? '9px' : '11px')
            .attr('font-weight', 'bold')
            .attr('fill', '#333')
            .attr('pointer-events', 'none')
            .text(d => {
                const stateName = stateNames[d.id.padStart(2, '0')] || 'Unknown';
                return stateAbbreviations[stateName] || stateName.substring(0, 2).toUpperCase();
            });

        // Add callout lines and labels for small states
        const smallStates = states.filter(d => {
            const bounds = path.bounds(d);
            const area = (bounds[1][0] - bounds[0][0]) * (bounds[1][1] - bounds[0][1]);
            return area < smallStateThreshold;
        });

        // Create callout labels for small states
        smallStates.forEach(d => {
            const bounds = path.bounds(d);
            const centerX = (bounds[0][0] + bounds[1][0]) / 2;
            const centerY = (bounds[0][1] + bounds[1][1]) / 2;
            const stateWidth = bounds[1][0] - bounds[0][0];
            const stateHeight = bounds[1][1] - bounds[0][1];

            // Position label outside the state
            let labelX = bounds[1][0] + 35; // Default: right
            let labelY = centerY;
            let lineEndX = bounds[1][0];
            let lineEndY = centerY;

            // If too far right, position above or below
            if (labelX > width - 50) {
                labelX = centerX;
                labelY = bounds[0][1] - 15;
                lineEndX = centerX;
                lineEndY = bounds[0][1];
            }

            // Draw line from state to label
            svg.append('line')
                .attr('x1', centerX)
                .attr('y1', centerY)
                .attr('x2', lineEndX)
                .attr('y2', lineEndY)
                .attr('stroke', '#999')
                .attr('stroke-width', 0.5)
                .attr('pointer-events', 'none');

            // Draw label background
            const stateName = stateNames[d.id.padStart(2, '0')] || 'Unknown';
            const abbr = stateAbbreviations[stateName] || stateName.substring(0, 2).toUpperCase();
            
            svg.append('rect')
                .attr('x', labelX - 12)
                .attr('y', labelY - 8)
                .attr('width', 24)
                .attr('height', 14)
                .attr('fill', 'white')
                .attr('stroke', '#999')
                .attr('stroke-width', 0.5)
                .attr('pointer-events', 'none');

            // Draw label text
            svg.append('text')
                .attr('x', labelX)
                .attr('y', labelY)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', width < 600 ? '8px' : '10px')
                .attr('font-weight', 'bold')
                .attr('fill', '#333')
                .attr('pointer-events', 'none')
                .text(abbr);
        });
        
        // Draw nation border
        svg.append('path')
            .datum(topojson.mesh(us, us.objects.states, (a, b) => a === b))
            .attr('fill', 'none')
            .attr('stroke', '#333')
            .attr('stroke-width', 1.5)
            .attr('d', path);
        
    }).catch(error => {
        console.error('Error loading map:', error);
        document.getElementById('mapContainer').innerHTML = '<p style="color: red; text-align: center;">Error loading map data.</p>';
    });
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadData);
