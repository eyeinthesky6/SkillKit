"""Tests for app"""
from app import greet

def test_greet():
    assert greet("Alice") == "Hello, Alice!"

