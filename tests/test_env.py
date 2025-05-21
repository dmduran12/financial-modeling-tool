import os
from backend.app.main import parse_env_list


def test_parse_env_list_strips_and_ignores_empty(monkeypatch):
    monkeypatch.setenv("TEST_ENV", " a , ,b ,, c ")
    assert parse_env_list("TEST_ENV", "") == ["a", "b", "c"]
    monkeypatch.delenv("TEST_ENV")
