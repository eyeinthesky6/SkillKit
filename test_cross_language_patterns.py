# Test file for cross-language pattern detection

# Test 1: Empty return patterns
def get_user_data(user_id):
    return []  # Should detect: EMPTY_RETURN_PATTERN

def get_config():
    return {}  # Should detect: EMPTY_RETURN_PATTERN

def get_user(user_id):
    return None  # Should detect: EMPTY_RETURN_PATTERN

# Test 2: Empty function bodies
def process_data(data):
    return data  # Should detect: EMPTY_FUNCTION_BODY

def calculate_total(items):
    return 0  # Should detect: EMPTY_FUNCTION_BODY

def process_data_empty(data):
    pass  # Should detect: EMPTY_FUNCTION_BODY

# Test 3: Always returns boolean
def validate_input(input):
    return True  # Should detect: ALWAYS_RETURNS_BOOLEAN

def has_permission(user):
    return False  # Should detect: ALWAYS_RETURNS_BOOLEAN

# Test 4: No-op async
async def fetch_data():
    return {}  # Should detect: No-op async pattern

# Test 5: Hardcoded return
def get_user(user_id):
    return {"id": user_id, "name": "Test User"}  # Should detect: Hardcoded return

# Test 6: Explicit TODOs with different comment syntax
# TODO: This is a Python TODO
# FIXME: This is a Python FIXME
# HACK: This is a Python HACK
