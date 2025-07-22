// DOM Elements
const countDisplay = document.getElementById('count');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');
const resetBtn = document.getElementById('reset');
const storeBtn = document.getElementById('store');
const submitBtn = document.getElementById('submit');
const showDataBtn = document.getElementById('show-data');
const clearDataBtn = document.getElementById('clear-data');
const blocksContainer = document.getElementById('blocks-container');
const modal = document.getElementById('confirmation-modal');
const confirmSubmitBtn = document.getElementById('confirm-submit');
const cancelSubmitBtn = document.getElementById('cancel-submit');
const blocksToSubmit = document.getElementById('blocks-to-submit');
const dataModal = document.getElementById('data-modal');
const closeDataBtn = document.getElementById('close-data-btn');
const closeDataBtnX = document.getElementById('close-data');
const dataContent = document.getElementById('data-content');
const loading = document.getElementById('loading');

// State
let count = 0;
const blocks = [];

// Event Listeners
incrementBtn.addEventListener('click', increment);
decrementBtn.addEventListener('click', decrement);
resetBtn.addEventListener('click', reset);
storeBtn.addEventListener('click', storeBlock);
submitBtn.addEventListener('click', showConfirmation);
confirmSubmitBtn.addEventListener('click', submitToDatabase);
cancelSubmitBtn.addEventListener('click', hideConfirmation);
showDataBtn.addEventListener('click', showData);
clearDataBtn.addEventListener('click', clearAllData);
closeDataBtn.addEventListener('click', hideDataModal);
closeDataBtnX.addEventListener('click', hideDataModal);

// Counter Functions
function increment() {
    count++;
    updateDisplay();
}

function decrement() {
    if (count > 0) {
        count--;
        updateDisplay();
    }
}

function reset() {
    count = 0;
    updateDisplay();
}

function updateDisplay() {
    countDisplay.textContent = count;
}

function storeBlock() {
    if (count > 0) {
        const timestamp = new Date().toLocaleString();
        const block = {
            count,
            timestamp
        };
        blocks.push(block);
        renderBlocks();
        reset();
    } else {
        alert("Count must be greater than 0 to store a block.");
    }
}

function renderBlocks() {
    blocksContainer.innerHTML = '';
    blocks.forEach((block, index) => {
        const blockElement = document.createElement('div');
        blockElement.className = 'block';
        blockElement.innerHTML = `
            <span>Block ${index + 1}: ${block.count} counts (${block.timestamp})</span>
            <button class="remove-block" data-index="${index}">Remove</button>
        `;
        blocksContainer.appendChild(blockElement);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-block').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            blocks.splice(index, 1);
            renderBlocks();
        });
    });
}

// Modal Functions
function showConfirmation() {
    if (blocks.length === 0) {
        alert("No blocks to submit.");
        return;
    }

    blocksToSubmit.innerHTML = '';
    blocks.forEach((block, index) => {
        const blockElement = document.createElement('div');
        blockElement.className = 'block';
        blockElement.textContent = `Block ${index + 1}: ${block.count} counts (${block.timestamp})`;
        blocksToSubmit.appendChild(blockElement);
    });

    modal.style.display = 'flex';
}

function hideConfirmation() {
    modal.style.display = 'none';
}

function showLoading() {
    loading.style.display = 'block';
}

function hideLoading() {
    loading.style.display = 'none';
}

// Database Functions
async function submitToDatabase() {
    if (blocks.length === 0) {
        alert("No blocks to submit.");
        return;
    }

    showLoading();
    
    try {
        const response = await fetch('/submit_blocks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ blocks }),
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Blocks submitted successfully to database!');
            blocks.length = 0; // Clear blocks array
            renderBlocks();
            hideConfirmation();
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error. Please try again.');
    } finally {
        hideLoading();
    }
}

async function showData() {
    showLoading();
    
    try {
        const response = await fetch('/get_data');
        const data = await response.json();
        
        if (data.success) {
            displayData(data.data);
            dataModal.style.display = 'flex';
        } else {
            alert(`Error loading data: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error. Please try again.');
    } finally {
        hideLoading();
    }
}

function displayData(submissions) {
    if (submissions.length === 0) {
        dataContent.innerHTML = '<p>No data found in database.</p>';
        return;
    }

    let html = `
        <div class="data-summary">
            <h3>Database Summary</h3>
            <p><strong>Total Submissions:</strong> ${submissions.length}</p>
            <p><strong>Total Blocks:</strong> ${submissions.reduce((sum, s) => sum + s.block_count, 0)}</p>
            <p><strong>Total Count:</strong> ${submissions.reduce((sum, s) => sum + (s.total_count || 0), 0)}</p>
        </div>
    `;

    submissions.forEach((submission, index) => {
        html += `
            <div class="submission-data">
                <h4>Submission ${index + 1}</h4>
                <p><strong>Date:</strong> ${new Date(submission.submission_date).toLocaleString()}</p>
                <p><strong>Blocks:</strong> ${submission.block_count} | <strong>Total Count:</strong> ${submission.total_count || 0}</p>
                <div class="submission-blocks">
        `;
        
        submission.blocks.forEach((block, blockIndex) => {
            html += `
                <div class="data-block">
                    Block ${blockIndex + 1}: ${block.count} counts (${block.timestamp})
                </div>
            `;
        });
        
        html += '</div></div>';
    });

    dataContent.innerHTML = html;
}

function hideDataModal() {
    dataModal.style.display = 'none';
}

async function clearAllData() {
    if (!confirm('Are you sure you want to clear ALL data from the database? This cannot be undone.')) {
        return;
    }

    showLoading();
    
    try {
        const response = await fetch('/clear_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        
        if (data.success) {
            alert('All data cleared successfully!');
            hideDataModal();
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error. Please try again.');
    } finally {
        hideLoading();
    }
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideConfirmation();
    }
    if (e.target === dataModal) {
        hideDataModal();
    }
});
