from flask import Flask, render_template, request, jsonify
import sqlite3
import json
from datetime import datetime
import os

app = Flask(__name__)

# Database configuration
DATABASE = 'tally_data.db'

def get_db_connection():
    """Create and return a database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with required tables"""
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            blocks_data TEXT NOT NULL
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS blocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            submission_id INTEGER,
            count INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (submission_id) REFERENCES submissions (id)
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def index():
    """Render the main tally counter page"""
    return render_template('index.html')

@app.route('/submit_blocks', methods=['POST'])
def submit_blocks():
    """Handle submission of tally blocks to database"""
    try:
        data = request.get_json()
        blocks = data.get('blocks', [])
        
        if not blocks:
            return jsonify({'success': False, 'message': 'No blocks to submit'})
        
        conn = get_db_connection()
        
        # Insert submission record
        cursor = conn.execute(
            'INSERT INTO submissions (blocks_data) VALUES (?)',
            (json.dumps(blocks),)
        )
        submission_id = cursor.lastrowid
        
        # Insert individual blocks
        for block in blocks:
            conn.execute(
                'INSERT INTO blocks (submission_id, count, timestamp) VALUES (?, ?, ?)',
                (submission_id, block['count'], block['timestamp'])
            )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': f'Successfully submitted {len(blocks)} blocks'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})

@app.route('/get_data')
def get_data():
    """Retrieve all submitted data from database"""
    try:
        conn = get_db_connection()
        
        # Get all submissions with their blocks
        submissions = conn.execute('''
            SELECT s.id, s.submission_date, s.blocks_data,
                   COUNT(b.id) as block_count,
                   SUM(b.count) as total_count
            FROM submissions s
            LEFT JOIN blocks b ON s.id = b.submission_id
            GROUP BY s.id, s.submission_date, s.blocks_data
            ORDER BY s.submission_date DESC
        ''').fetchall()
        
        # Get detailed blocks for each submission
        result = []
        for submission in submissions:
            blocks = conn.execute('''
                SELECT count, timestamp
                FROM blocks
                WHERE submission_id = ?
                ORDER BY id
            ''', (submission['id'],)).fetchall()
            
            result.append({
                'id': submission['id'],
                'submission_date': submission['submission_date'],
                'block_count': submission['block_count'],
                'total_count': submission['total_count'],
                'blocks': [{'count': b['count'], 'timestamp': b['timestamp']} for b in blocks]
            })
        
        conn.close()
        
        return jsonify({'success': True, 'data': result})
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})

@app.route('/clear_data', methods=['POST'])
def clear_data():
    """Clear all data from database (optional endpoint)"""
    try:
        conn = get_db_connection()
        conn.execute('DELETE FROM blocks')
        conn.execute('DELETE FROM submissions')
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'All data cleared successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})

if __name__ == '__main__':
    # Initialize database on startup
    init_db()
    print("Database initialized successfully!")
    print(f"Database file: {os.path.abspath(DATABASE)}")
    
    # Run the Flask app
    app.run(debug=True, host='127.0.0.1', port=5000)
