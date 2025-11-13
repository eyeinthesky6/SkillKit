"""Test file with extended Python patterns"""

# Basic patterns (already covered)
# TODO: Basic TODO
def basic_todo():
    pass  # FIXME: Basic FIXME

# NotImplementedError patterns (already covered)
def not_implemented_error():
    raise NotImplementedError("Not implemented")

# Ellipsis patterns (already covered)
def ellipsis_method():
    ...

class EllipsisClass:
    ...

# NEW PATTERNS TO TEST

# NotImplemented constant
def not_implemented_constant():
    return NotImplemented

# Assert False with TODO
def assert_false_todo():
    assert False, "TODO: Implement this method"

# Raise with TODO message
def raise_todo():
    raise ValueError("TODO: Implement proper validation")

# Pragma no cover with TODO
def pragma_no_cover_todo():  # pragma: no cover TODO: implement
    pass

# Type ignore with TODO
def type_ignore_todo():  # type: ignore TODO: fix typing
    return "something"

# Pylint disable with TODO
def pylint_disable_todo():  # pylint: disable=unused-argument TODO: use arg
    return None

# noqa with TODO
def noqa_todo():  # noqa TODO: fix this
    x = 1  # unused variable

# Docstring with TODO
def docstring_todo():
    """This function TODO: needs implementation"""
    pass

# Pass-only function
def pass_only_function():
    pass

# Main block with pass
if __name__ == "__main__":
    pass

# Class with ellipsis
class ClassWithEllipsis:
    ...

# Method with ellipsis
def method_with_ellipsis():
    ...
