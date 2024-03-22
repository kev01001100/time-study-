//=========================================================
// - Start button for the stopwatch
// Functionality: calculates elapsed time (mm:ss:SS)
//                calculates time in industrial format (IM)
//=========================================================
let timer = null;
let startTime = 0;

document.getElementById('startBtn').onclick = function() {
    if (timer === null) {
        startTime = Date.now();

        // update stopwatch 
        function updateStopwatch() {
            const elapsedTime = Date.now() - startTime; 
            
            // elapsed time format
            const totalSeconds = elapsedTime / 1000;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = Math.floor(totalSeconds % 60);
            const milliseconds = elapsedTime % 1000;
        
            // elapsed time decimal format
            const minutesFormatted = minutes.toString().padStart(2, '0');
            const secondsFormatted = seconds.toString().padStart(2, '0');
            const millisecondsFormatted = milliseconds.toString().padStart(3, '0');
            
            // calculate industrial time (minutes as a decimal fraction of an hour)
            const industrialMinutes = (elapsedTime / 60000).toFixed(2);
        
            // display mm:ss.SSS and IM
            document.getElementById('stopwatchDisplay').textContent = 
                `Elapsed Time: ${minutesFormatted}:${secondsFormatted}.${millisecondsFormatted} / ${industrialMinutes} IM`;
        }
        
        // update stopwatch to show 00:00:00 at the start
        updateStopwatch();

        // update the stopwatch every 10 millisec
        timer = setInterval(updateStopwatch, 10);
        // disable the start btn when started the stopwatch
        document.getElementById('startBtn').disabled = true;
    }
};


//=========================================================
// - Stop button for the stopwatch
// Functionality: stop the elapsed time (mm:ss:SS)
//=========================================================
document.getElementById('stopBtn').onclick = function() {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
        document.getElementById('startBtn').disabled = false;
    }
};


//=========================================================
// - Lock button
// Functionality: disable the delete button to prevent 
//                accidental deletion of an element when 
//                the stop watch started
//=========================================================
let isLocked = false; 

document.getElementById('lockAllBtn').addEventListener('click', function() {
    isLocked = !isLocked; 
    updateDeleteButtons();
    this.textContent = isLocked ? 'Unlock All' : 'Lock All'; 
});

function updateDeleteButtons() {
    const deleteButtons = document.querySelectorAll('#leftTable button.deleteBtn');
    deleteButtons.forEach(button => {
        button.disabled = isLocked;
        if (isLocked) {
            button.classList.add('disabled'); // disabled class when locked
        } else {
            button.classList.remove('disabled'); // remove disabled class when unlocked
        }
    });
}


//=========================================================
// - Add Elements Button and Input Field 
// Functionality: retrieve the value from elementInput and 
//                create a new row into the element Library 
//                table.
// Add button: add the element from library to yourList.
// Delete button: remove the element added to the library table
//=========================================================
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
        addButton.className = 'btn'; // .btn styling
        addButton.onclick = function() {
            addToRightTable(value);
        };
        cell2.appendChild(addButton);

        const cell3 = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn deleteBtn'; // btn styling 
        deleteButton.disabled = isLocked; // isLocked disabled state
        deleteButton.onclick = function() {
            row.parentNode.removeChild(row);
        };
        cell3.appendChild(deleteButton);

        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);
        document.getElementById('leftTable').appendChild(row);

        input.value = ''; // clear the input field after the value has been submitted
    }
});

let lastLapTime = 0; 

function addToRightTable(value) {
    if (timer !== null) { 
        const now = Date.now();
        const lapTime = now - (lastLapTime || startTime);
        lastLapTime = now; 

        // calculate industrial time
        const lapMinutes = lapTime / 60000; 
        const industrialLapMinutes = lapMinutes.toFixed(2); 

        // create a new row
        const row = document.createElement('tr');
        const cell1 = document.createElement('td');
        cell1.textContent = value;

        // create and append industrial time cell
        const cell2 = document.createElement('td');
        cell2.textContent = `${industrialLapMinutes}`;
        
        // create and append delete button cell specifically for the right table
        const cell3 = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn deleteBtnRight'; 

        deleteButton.onclick = function() {
            row.remove(); // remove the row from the table
        };

        cell3.appendChild(deleteButton);

        // append cells to the row
        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);

        // append the row to the right table
        document.getElementById('rightTable').appendChild(row);
    }
}

document.getElementById('exportBtn').addEventListener('click', exportToExcel);

function exportToExcel() {
    // csv content w/ UTF-8 BOM for special character 
    let csvContent = "\uFEFF";

    // add headers
    csvContent += "Element,Time (Mins)\n";

    // iterate over each row in the right table, skipping the header
    document.querySelectorAll("#rightTable tr").forEach((row, index) => {
        if (index === 0) return; // Skip header

        // extract text from each cell in the row
        const cells = row.querySelectorAll("td:not(:last-child)");
        // extract textContent from each cell
        // wrap each value in quotes (special characters interpreted correctly)
        const rowData = [...cells].map(cell => `"${cell.innerText}"`).join(",");

        // add the row data to the CSV content
        csvContent += rowData + "\n";
    });

    // encode the csv content
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);

    // trigger the download
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "time_study_data.csv");

    // append the link to the body, click it, and then remove it
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
}
 
document.getElementById('importElementsBtn').addEventListener('click', function() {
    const input = document.getElementById('elementListInput');
    const elements = input.value.trim().split('\n'); 

    elements.forEach(element => {
        const value = element.trim(); 
        if (value) {
            createInitialRowForElement(value); // add each element to the elem Lib
        }
    });

    input.value = ''; // clear input field after importing
});

// create initial row for element in the left table
function createInitialRowForElement(elementName) {
    const tableBody = document.getElementById('leftTable').querySelector('tbody');
    const elementRow = document.createElement('tr');
    
    // element name cell
    const cell = document.createElement('td');
    cell.textContent = elementName;
    elementRow.appendChild(cell);

    // add button cell
    const addButtonCell = document.createElement('td');
    const addButton = document.createElement('button');
    addButton.textContent = 'Add';
    addButton.className = 'btn';
    addButton.onclick = function() {
        addToRightTable(elementName);
    };
    addButtonCell.appendChild(addButton);
    elementRow.appendChild(addButtonCell);

    // delete button cell
    const deleteButtonCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'btn deleteBtn';
    deleteButton.disabled = isLocked;
    deleteButton.onclick = function() {
        elementRow.remove();
    };
    deleteButtonCell.appendChild(deleteButton);
    elementRow.appendChild(deleteButtonCell);

    tableBody.appendChild(elementRow);
}

function deleteElement(elementName) {
    const rows = document.querySelectorAll('#leftTable tbody tr');
    rows.forEach(row => {
        const cellValue = row.cells[0].textContent; 
        if (cellValue === elementName) {
            row.parentNode.removeChild(row);  
        }
    });
} 

//=========================================================
// - Popup Note 
// Functionality: reminder how to import elements properly
//=========================================================
// close the popup note
function closePopup() {
    document.getElementById('popupNote').style.display = 'none';
}

// show popup note when page loads
window.onload = function() {
    document.getElementById('popupNote').style.display = 'flex';
}