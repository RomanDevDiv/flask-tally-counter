# Flask Tally Counter

A web-based tally counter application built with Flask that automatically stores data to a SQLite database.

## Features

- **Counter**: Increment, decrement, and reset functionality
- **Block Storage**: Store current count as blocks with timestamps
- **Database Integration**: Automatically submit blocks to SQLite database
- **Data Viewing**: View all submitted data with detailed breakdowns
- **Data Management**: Clear all data from database
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
flask-tally-counter/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── tally_data.db         # SQLite database (auto-created)
├── templates/
│   └── index.html        # HTML template
└── static/
    ├── styles.css        # CSS styles
    └── script.js         # JavaScript functionality
```

## Setup Instructions

### 1. Create Project Directory
```bash
mkdir flask-tally-counter
cd flask-tally-counter
```

### 2. Create Virtual Environment (Recommended)
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Create Directory Structure
```bash
mkdir templates
mkdir static
```

### 5. Add Files
- Copy `app.py` to the root directory
- Copy `index.html` to the `templates/` folder
- Copy `styles.css` and `script.js` to the `static/` folder

### 6. Run the Application
```bash
python app.py
```

The application will be available at: `http://127.0.0.1:5000`

## Usage

1. **Count**: Use +/- buttons to increment/decrement the counter
2. **Store Block**: Click "Store Block" to save current count as a block
3. **Submit**: Click "Submit All Blocks" to save blocks to database
4. **Show Data**: Click "Show Data" to view all submitted data
5. **Clear Data**: Click "Clear All Data" to remove all database records

## Database Schema

The application uses SQLite with two tables:

### submissions
- `id` (PRIMARY KEY)
- `submission_date` (DATETIME)
- `blocks_data` (TEXT) - JSON string of blocks

### blocks
- `id` (PRIMARY KEY)
- `submission_id` (FOREIGN KEY)
- `count` (INTEGER)
- `timestamp` (TEXT)

## API Endpoints

- `GET /` - Main application page
- `POST /submit_blocks` - Submit blocks to database
- `GET /get_data` - Retrieve all submitted data
- `POST /clear_data` - Clear all database records

## Development Notes

- Database is automatically created on first run
- All data is stored locally in SQLite
- No external dependencies required beyond Flask
- Responsive design works on mobile devices

## VSCode Integration

To run in VSCode:
1. Open the project folder in VSCode
2. Open integrated terminal (Ctrl+`)
3. Activate virtual environment if using one
4. Run `python app.py`
5. Click on the localhost link or go to http://127.0.0.1:5000

## Troubleshooting

- **Port already in use**: Change port in app.py: `app.run(debug=True, port=5001)`
- **Database errors**: Delete `tally_data.db` to reset database
- **Template not found**: Ensure `templates/` directory exists with `index.html`
- **Static files not loading**: Ensure `static/` directory exists with CSS/JS files
