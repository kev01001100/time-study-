let timer = null;
let startTime = 0;

document.getElementById('startBtn').onclick = function() {
    if (timer === null) {
        startTime = Date.now();

        // Function to update stopwatch with high precision
        function updateStopwatch() {
            const elapsedTime = Date.now() - startTime;
            const totalSeconds = elapsedTime / 1000;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = Math.floor(totalSeconds % 60);
            const milliseconds = elapsedTime % 1000; // Get milliseconds
        
            const minutesFormatted = minutes.toString().padStart(2, '0');
            const secondsFormatted = seconds.toString().padStart(2, '0');
            const millisecondsFormatted = milliseconds.toString().padStart(3, '0');
            
            // Calculate industrial time (minutes as a decimal fraction of an hour)
            const industrialMinutes = (elapsedTime / 60000).toFixed(2);
            // Two decimal places for precision
        
            // Update the display to show both mm:ss.SSS format and IM
            document.getElementById('stopwatchDisplay').textContent = 
                `Elapsed Time: ${minutesFormatted}:${secondsFormatted}.${millisecondsFormatted} / ${industrialMinutes} IM`;
        }
        
        // Immediately update the stopwatch to show 00:00:00 at the start
        updateStopwatch();

        // Update the stopwatch every 10 milliseconds for high precision
        timer = setInterval(updateStopwatch, 10);

        document.getElementById('startBtn').disabled = true;
    }
};

document.getElementById('stopBtn').onclick = function() {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
        document.getElementById('startBtn').disabled = false;
    }
};


document.getElementById('stopBtn').onclick = function() {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
        document.getElementById('startBtn').disabled = false;
    }
};


let isLocked = false; // Global lock state

document.getElementById('lockAllBtn').addEventListener('click', function() {
    isLocked = !isLocked; // Toggle lock state
    updateDeleteButtons(); // Update the state of delete buttons
    this.textContent = isLocked ? 'Unlock All' : 'Lock All'; // Update button text
});

function updateDeleteButtons() {
    // Get all delete buttons
    const deleteButtons = document.querySelectorAll('#leftTable button.deleteBtn');
    deleteButtons.forEach(button => {
        button.disabled = isLocked; // Disable or enable based on isLocked
    });
}

document.getElementById('addElementBtn').addEventListener('click', function() {
    const input = document.getElementById('elementInput');
    const value = input.value.trim();
    if (value) {
        const row = document.createElement('tr');
        const cell1 = document.createElement('td');
        cell1.textContent = value;

        const cell2 = document.createElement('td');
        const addButton = document.createElement('button');
        addButton.textContent = 'Add';
        addButton.onclick = function() {
            addToRightTable(value);
        };
        cell2.appendChild(addButton);

        const cell3 = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('deleteBtn'); // Add class for selection
        deleteButton.disabled = isLocked; // Initialize based on isLocked
        deleteButton.onclick = function() {
            row.parentNode.removeChild(row);
        };
        cell3.appendChild(deleteButton);

        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);
        document.getElementById('leftTable').appendChild(row);

        input.value = ''; // Clear input field
    }
});

let lastLapTime = 0; // Initialize the last lap time

function addToRightTable(value) {
    if (timer !== null) { // Only add if timer is running
        const now = Date.now();
        const elapsedSinceStart = now - startTime;
        const lapTime = now - (lastLapTime || startTime);
        lastLapTime = now; // Update lastLapTime for the next lap

        // Calculate industrial time (minutes as a decimal fraction of an hour)
        const lapMinutes = lapTime / 60000; // Lap time in minutes
        const industrialLapMinutes = lapMinutes.toFixed(2); // Two decimal places for precision

        // Update the content of the second cell with the Industrial Time (IM)
        const cell2 = document.createElement('td');
        cell2.textContent = `${industrialLapMinutes} IM`;

        // Create a new row
        const row = document.createElement('tr');
        const cell1 = document.createElement('td');
        cell1.textContent = value;
        
        // Append cells to the row
        row.appendChild(cell1);
        row.appendChild(cell2);

        // Append the row to the right table
        document.getElementById('rightTable').appendChild(row);
    }
}





document.getElementById('exportBtn').addEventListener('click', exportToExcel);

function exportToExcel() {
    let csvContent = "data:text/csv;charset=utf-8,Element,Time (Mins)\n";

    // Select rows from the right table, skipping the header row
    document.querySelectorAll("#rightTable tr").forEach((row, index) => {
        if (index === 0) return; // Skip header
        const cells = row.querySelectorAll("td");
        const rowData = [cells[0].innerText, cells[1].innerText.replace('Lap: ', '').replace(' min', '')].join(",");
        csvContent += rowData + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "time_study_data.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
}

document.getElementById('importElementsBtn').addEventListener('click', function() {
    const input = document.getElementById('elementListInput');
    const elements = input.value.trim().split('\n'); // Split input by line breaks

    elements.forEach(element => {
        const value = element.trim(); // Remove leading and trailing whitespace
        if (value) {
            createInitialRowForElement(value); // Add each element to the left table
        }
    });

    input.value = ''; // Clear input field after importing
});

// Update the createInitialRowForElement function to correctly append rows to the tbody
function createInitialRowForElement(elementName) {
    const tableBody = document.getElementById('leftTable').querySelector('tbody');
    const elementRow = document.createElement('tr');
    
    const cell = document.createElement('td');
    cell.textContent = elementName;
    elementRow.appendChild(cell);

    const addButtonCell = document.createElement('td');
    const addButton = document.createElement('button');
    addButton.textContent = 'Add';
    addButton.onclick = function() {
        addToRightTable(elementName);
    };
    addButtonCell.appendChild(addButton);
    elementRow.appendChild(addButtonCell);

    tableBody.appendChild(elementRow);
}
