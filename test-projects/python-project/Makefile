.PHONY: install test lint format typecheck clean

install:
	poetry install

test:
	poetry run pytest

lint:
	poetry run flake8 app.py test_app.py

format:
	poetry run black app.py test_app.py

typecheck:
	poetry run mypy app.py

clean:
	rm -rf __pycache__ .pytest_cache .mypy_cache

