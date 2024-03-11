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
    // get all delete buttons
    const deleteButtons = document.querySelectorAll('#leftTable button.deleteBtn');
    deleteButtons.forEach(button => {
        button.disabled = isLocked; 
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
        addButton.onclick = function() {
            addToRightTable(value);
        };
        cell2.appendChild(addButton);

        const cell3 = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('deleteBtn');  
        deleteButton.disabled = isLocked; 
        deleteButton.onclick = function() {
            row.parentNode.removeChild(row);
        };
        cell3.appendChild(deleteButton);

        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);
        document.getElementById('leftTable').appendChild(row);

        input.value = ''; // clear input field after submitted a value
    }
});

let lastLapTime = 0; 

function addToRightTable(value) {
    if (timer !== null) { 
        const now = Date.now();
        const elapsedSinceStart = now - startTime;
        const lapTime = now - (lastLapTime || startTime);
        lastLapTime = now; 

        // calculate industrial time
        const lapMinutes = lapTime / 60000; 
        const industrialLapMinutes = lapMinutes.toFixed(2); 

        // update with industrial time
        const cell2 = document.createElement('td');
        cell2.textContent = `${industrialLapMinutes} IM`;

        // create a new row
        const row = document.createElement('tr');
        const cell1 = document.createElement('td');
        cell1.textContent = value;
        
        // append cells to the row
        row.appendChild(cell1);
        row.appendChild(cell2);

        // append the rows to yourList
        document.getElementById('rightTable').appendChild(row);
    }
}


document.getElementById('exportBtn').addEventListener('click', exportToExcel);

function exportToExcel() {
    let csvContent = "data:text/csv;charset=utf-8,Element,Time (Mins)\n";

    document.querySelectorAll("#rightTable tr").forEach((row, index) => {
        if (index === 0) return; // skip header
        const cells = row.querySelectorAll("td"); // row
        const rowData = [cells[0].innerText, cells[1].innerText.replace('Lap: ', '').replace(' min', '')].join(",");
        csvContent += rowData + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "time_study_data.csv");
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

function createInitialRowForElement(elementName) {
    const tableBody = document.getElementById('leftTable').querySelector('tbody');
    const elementRow = document.createElement('tr');
    
    // element name
    const cell = document.createElement('td');
    cell.textContent = elementName;
    elementRow.appendChild(cell);

    // add btn
    const addButtonCell = document.createElement('td');
    const addButton = document.createElement('button');
    addButton.textContent = 'Add';
    addButton.onclick = function() {
        addToRightTable(elementName);
    };
    addButtonCell.appendChild(addButton);
    elementRow.appendChild(addButtonCell);

     // delete btn
     const deleteButtonCell = document.createElement('td');
     const deleteButton = document.createElement('button');
     deleteButton.textContent = 'Delete';
     deleteButton.classList.add('deleteBtn');  
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