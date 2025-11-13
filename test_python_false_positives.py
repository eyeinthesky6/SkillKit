"""Test file for Python false positive reduction"""

# LEGITIMATE USES (should not be flagged)

# Legitimate NotImplemented in comparison
def __eq__(self, other):
    if not isinstance(other, MyClass):
        return NotImplemented
    return self.value == other.value

# Abstract method (legitimate pass)
from abc import ABC, abstractmethod

class MyAbstractClass(ABC):
    @abstractmethod
    def my_method(self):
        pass

# Dunder method (legitimate pass)
class MyClass:
    def __init__(self):
        pass

    def __str__(self):
        return "MyClass"

# Test method (legitimate pass)
def test_my_function():
    pass

# Legitimate docstring (should not be flagged)
def my_function():
    """This function TODO: already implemented properly"""
    return "done"

# ILLEGITIMATE USES (should be flagged)

# Illegitimate NotImplemented
def bad_function():
    return NotImplemented  # This should be flagged

# Illegitimate pass-only function
def incomplete_function():
    pass  # This should be flagged

# Illegitimate docstring
def another_function():
    """This function TODO: needs implementation"""
    pass

# Illegitimate assert False
def failing_function():
    assert False, "TODO: Implement this properly"
