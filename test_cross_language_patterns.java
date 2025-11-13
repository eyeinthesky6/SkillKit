// Test file for cross-language pattern detection in Java

// Test 1: Empty return patterns
public List<User> getUsers() {
    return new ArrayList<>();  // Should detect: EMPTY_RETURN_PATTERN
}

public Map<String, Object> getConfig() {
    return new HashMap<>();  // Should detect: EMPTY_RETURN_PATTERN
}

public User getUser(String userId) {
    return null;  // Should detect: EMPTY_RETURN_PATTERN
}

// Test 2: Empty function bodies
public Data processData(Data data) {
    return data;  // Should detect: EMPTY_FUNCTION_BODY
}

public int calculateTotal(List<Item> items) {
    return 0;  // Should detect: EMPTY_FUNCTION_BODY
}

// Test 3: Always returns boolean
public boolean validateInput(String input) {
    return true;  // Should detect: ALWAYS_RETURNS_BOOLEAN
}

public boolean hasPermission(User user) {
    return false;  // Should detect: ALWAYS_RETURNS_BOOLEAN
}

// Test 4: Explicit TODOs
// TODO: This is a Java TODO
// FIXME: This is a Java FIXME
// HACK: This is a Java HACK
