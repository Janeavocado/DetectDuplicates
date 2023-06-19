// Global array to store collected data
let data = [];

// Function to insert data
function insertData(event) {
  event.preventDefault(); // Prevent form submission

  const pasteArea = document.getElementById('pasteArea');
  const pasteData = pasteArea.value;

  if (!pasteData) {
    alert('Please paste data into the textarea.');
    return;
  }

  const rows = pasteData.split('\n').map(row => row.trim());

  // Remove empty rows
  const nonEmptyRows = rows.filter(row => row !== '');

  const rowData = nonEmptyRows.map(row => {
    const columns = row.split('\t');
    return {
      accountCode: columns[0],
      accountDesc: columns[1],
      workorder: columns[2],
      objectCode: columns[3],
      objectDesc: columns[4],
      createDate: columns[5],
      requiredByDate: columns[6],
      quantity: columns[7],
      applyCharge: columns[8],
      pickupAddrLine1: columns[9],
      pickupAddrRoute: columns[10],
      actionCode: columns[11],
      isDuplicated: false // Initialize isDuplicated to false
    };
  });

  // Check for duplicate data based on the "workorder" column
  const existingWorkorders = data.map(item => item.workorder);
  rowData.forEach(row => {
    if (existingWorkorders.includes(row.workorder)) {
      row.isDuplicated = true;
    }
  });

  // Check if any duplicates were found
  const duplicatesExist = rowData.some(row => row.isDuplicated);

  if (duplicatesExist) {
    alert('Duplicate data found!');
  }

  // Insert data
  data.unshift(...rowData);

  // Save data to local storage
  localStorage.setItem('collectedData', JSON.stringify(data));

  // Refresh the table
  displayData();

  // Clear the textarea
  pasteArea.value = '';
}

// Function to delete data by index
function deleteData(index) {
  const isConfirmed = confirm('Are you sure you want to delete this row?');

  if (!isConfirmed) {
    return;
  }

  data.splice(index, 1);

  // Save updated data to local storage
  localStorage.setItem('collectedData', JSON.stringify(data));

  // Refresh the table
  displayData();
}

// Function to select all duplicate rows
function selectAllDuplicates() {
  const duplicateRows = Array.from(document.querySelectorAll('.duplicate-row'));
  duplicateRows.forEach(row => {
    const checkbox = row.querySelector('input[name="rowCheckbox"]');
    checkbox.checked = true;
  });
}

// Function to delete selected data
function deleteSelectedData() {
  const selectedRows = Array.from(document.querySelectorAll('input[name="rowCheckbox"]:checked'))
    .map(checkbox => parseInt(checkbox.value));

  if (selectedRows.length === 0) {
    alert('Please select at least one row to delete.');
    return;
  }

  const isConfirmed = confirm('Are you sure you want to delete the selected rows?');

  if (!isConfirmed) {
    return;
  }

  // Remove selected rows from data
  data = data.filter((_, index) => !selectedRows.includes(index));

  // Save updated data to local storage
  localStorage.setItem('collectedData', JSON.stringify(data));

  // Refresh the table
  displayData();
}

// Function to display data as a table
function displayData() {
  const tableBody = document.getElementById('dataBody');
  tableBody.innerHTML = ''; // Clear existing rows

  data.forEach((item, index) => {
    const row = document.createElement('tr');

    if (item.isDuplicated) {
      row.classList.add('duplicate-row');
    }

    // Checkbox column
    const checkboxCell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'rowCheckbox';
    checkbox.value = index;
    checkboxCell.appendChild(checkbox);
    row.appendChild(checkboxCell);

    // Delete button column
    const deleteCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', () => deleteData(index));
    deleteCell.appendChild(deleteButton);
    row.appendChild(deleteCell);

    for (const key in item) {
      if (key !== 'isDuplicated') {
        const cell = document.createElement('td');
        cell.textContent = item[key];
        row.appendChild(cell);
      }
    }

    tableBody.appendChild(row);
  });
}

// Load data from local storage on page load
document.addEventListener('DOMContentLoaded', () => {
  const storedData = localStorage.getItem('collectedData');
  if (storedData) {
    data = JSON.parse(storedData);
    displayData();
  }
});

// Add event listener to the form
const form = document.getElementById('dataForm');
form.addEventListener('submit', insertData);

// Add event listener to the "Delete Selected" button
const deleteSelectedButton = document.getElementById('deleteSelectedButton');
deleteSelectedButton.addEventListener('click', deleteSelectedData);

// Add event listener to the "Select All Duplicates" button
const selectAllDuplicatesButton = document.getElementById('selectAllDuplicatesButton');
selectAllDuplicatesButton.addEventListener('click', selectAllDuplicates);