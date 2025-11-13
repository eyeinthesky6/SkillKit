"""
Real AI-Generated Code Patterns Based on Research
Based on findings from:
- GitHub Copilot security studies (29.5% Python, 24.2% JavaScript vulnerabilities)
- AI code detection research
- Common AI-generated code characteristics
"""

# Pattern 1: Overly Generic Comments (AI Characteristic)
def process_data(data):
    """
    Process data.
    
    This function processes the input data.
    """
    # Process the data
    result = data
    return result

# Pattern 2: Repetitive Template-Like Structures
def calculate_sum(items):
    """Calculate sum of items."""
    total = 0
    for item in items:
        total = total + item
    return total

def calculate_product(items):
    """Calculate product of items."""
    result = 1
    for item in items:
        result = result * item
    return result

# Pattern 3: Lack of Error Handling (29.5% of AI code has security issues)
def divide_numbers(a, b):
    """
    Divide two numbers.
    
    Args:
        a: First number
        b: Second number
    
    Returns:
        Division result
    """
    # TODO: Add error handling for division by zero
    return a / b

# Pattern 4: Hardcoded Secrets (Security Vulnerability)
API_KEY = "sk-1234567890abcdef"  # TODO: Move to environment variable
DATABASE_PASSWORD = "password123"  # TODO: Use secure storage

# Pattern 5: Inconsistent Comments
def fetch_user_data(user_id):
    # Get user data from database
    # TODO: Implement actual database query
    return {"id": user_id, "name": "User"}

# Pattern 6: Missing Edge Case Handling
def find_max(numbers):
    """
    Find maximum number in list.
    
    Args:
        numbers: List of numbers
    
    Returns:
        Maximum number
    """
    # Basic implementation - could be enhanced
    if not numbers:
        return None
    max_num = numbers[0]
    for num in numbers:
        if num > max_num:
            max_num = num
    return max_num

# Pattern 7: Generic Variable Names (AI Characteristic)
def process_items(items):
    """Process items."""
    data = []
    for item in items:
        result = item
        data.append(result)
    return data

# Pattern 8: Literal Comments (AI Characteristic)
def increment_counter(counter):
    # Increment counter by 1
    counter = counter + 1
    return counter

# Pattern 9: Placeholder Error Handling
def connect_to_api():
    """
    Connect to external API.
    
    Returns:
        Connection status
    """
    try:
        # TODO: Implement actual API connection
        return True
    except Exception as e:
        # Basic error handling
        print(f"Error: {e}")
        return False

# Pattern 10: Incomplete Security Implementation
def hash_password(password):
    """
    Hash password for storage.
    
    Args:
        password: Plain text password
    
    Returns:
        Hashed password
    """
    # TODO: Use proper hashing algorithm (bcrypt, argon2, etc.)
    # Simple hash for now
    return hash(password)

# Pattern 11: Mock Data Without Clear Indication
def get_user_profile(user_id):
    """
    Get user profile information.
    
    Args:
        user_id: User identifier
    
    Returns:
        User profile data
    """
    # Placeholder implementation
    return {
        "id": user_id,
        "name": "John Doe",
        "email": "user@example.com",
        "created_at": "2024-01-01"
    }

# Pattern 12: Generic Function Names
def process(data):
    """Process data."""
    return data

def handle(item):
    """Handle item."""
    return item

# Pattern 13: Missing Input Validation
def create_account(username, email, password):
    """
    Create new user account.
    
    Args:
        username: Username
        email: Email address
        password: Password
    
    Returns:
        Account creation status
    """
    # TODO: Add input validation
    # TODO: Check if username/email already exists
    # TODO: Validate password strength
    return {"status": "created", "username": username}

# Pattern 14: Incomplete Async Implementation
async def fetch_data(url):
    """
    Fetch data from URL.
    
    Args:
        url: URL to fetch from
    
    Returns:
        Fetched data
    """
    # TODO: Implement actual HTTP request
    # Placeholder for now
    return {"data": "placeholder"}

# Pattern 15: Hardcoded Configuration Values
class Config:
    """Application configuration."""
    
    # TODO: Move to environment variables
    DATABASE_HOST = "localhost"
    DATABASE_PORT = 5432
    DATABASE_NAME = "app_db"
    DATABASE_USER = "admin"
    DATABASE_PASSWORD = "admin123"
    
    API_TIMEOUT = 30  # TODO: Make configurable
    MAX_RETRIES = 3  # TODO: Adjust based on use case

# Pattern 16: Empty Exception Handlers
def risky_operation():
    """
    Perform risky operation.
    
    Returns:
        Operation result
    """
    try:
        # TODO: Implement actual operation
        result = None
        return result
    except:
        # TODO: Add proper error handling
        pass

# Pattern 17: Incomplete Type Hints (Python)
def calculate_total(items: list) -> float:
    """
    Calculate total of items.
    
    Args:
        items: List of numbers
    
    Returns:
        Total sum
    """
    # TODO: Add type validation
    total = 0.0
    for item in items:
        total += item
    return total

# Pattern 18: Generic Error Messages
def validate_input(value):
    """
    Validate input value.
    
    Args:
        value: Input to validate
    
    Returns:
        Validation result
    """
    if not value:
        raise ValueError("Invalid input")  # TODO: Add specific error message
    return True

# Pattern 19: Placeholder Logging
import logging

def setup_logging():
    """
    Setup logging configuration.
    """
    # TODO: Configure proper logging
    # Basic setup for now
    logging.basicConfig(level=logging.INFO)

# Pattern 20: Incomplete Documentation
def complex_algorithm(data):
    """
    Process data using complex algorithm.
    """
    # Algorithm implementation
    result = data
    return result

# Pattern 21: Security Vulnerability - SQL Injection Risk
def get_user_by_id(user_id):
    """
    Get user by ID from database.
    
    Args:
        user_id: User identifier
    
    Returns:
        User data
    """
    # TODO: Use parameterized queries
    query = f"SELECT * FROM users WHERE id = {user_id}"
    # TODO: Execute query safely
    return None

# Pattern 22: Missing Authentication Check
def delete_user(user_id):
    """
    Delete user account.
    
    Args:
        user_id: User identifier
    
    Returns:
        Deletion status
    """
    # TODO: Add authentication check
    # TODO: Verify user has permission
    # TODO: Add audit logging
    return {"status": "deleted"}

# Pattern 23: Incomplete Rate Limiting
def api_call(endpoint):
    """
    Make API call to endpoint.
    
    Args:
        endpoint: API endpoint
    
    Returns:
        API response
    """
    # TODO: Implement rate limiting
    # TODO: Add retry logic
    # TODO: Handle rate limit errors
    return {"status": "success"}

# Pattern 24: Generic Return Values
def check_status():
    """Check system status."""
    # TODO: Implement actual status check
    return True

def is_available():
    """Check if service is available."""
    # TODO: Implement actual availability check
    return True

# Pattern 25: Missing Input Sanitization
def search_query(query):
    """
    Process search query.
    
    Args:
        query: Search query string
    
    Returns:
        Search results
    """
    # TODO: Sanitize input
    # TODO: Prevent injection attacks
    results = []
    return results
