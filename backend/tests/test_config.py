from contextlib import contextmanager
from importlib import reload

import pytest
from pydantic_settings import SettingsConfigDict

import src.config


@pytest.fixture
def env_variables():
    return {
        "api_location": "http://random.com:5432",
        "csrf_secret_key": "csrf-secret-key",
        "home_location": "http://different.random.com:8000",
        "mongodb_uri": "mongodb://completely.different.com/name?directConnection=true",
        "mongodb_test_uri": "mongodb://completely.very.different.com/dbname?directConnection=true",
        "secret_key": "secret-key-for-jwt",
    }


@pytest.fixture
@contextmanager
def mock_env(monkeypatch, env_variables):
    with monkeypatch.context() as patch:
        for key, value in env_variables.items():
            patch.setenv(key.upper(), value)
        yield


def test_get_settings_reads_from_env_file(monkeypatch, tmp_path, env_variables):
    env_file = tmp_path / "env"
    env_file.write_text(
        "\n".join(f"{key.upper()}={value}" for key, value in env_variables.items())
    )

    monkeypatch.setattr(
        src.config.Settings,
        "model_config",
        SettingsConfigDict(env_file=env_file, extra="ignore"),
    )
    config = src.config.get_settings()
    # Make sure changed .env file is used
    config.__init__(**{})

    for key, value in env_variables.items():
        assert getattr(config, key) == value


def test_get_settings_reads_environment_variables(env_variables, mock_env):
    with mock_env:
        # Reload allows to pickup new environement variables set by mock_env
        reload(src.config)
        config = src.config.get_settings()

        for key, value in env_variables.items():
            assert getattr(config, key) == value
    # Make sure module will not use patched variables anymore
    reload(src.config)


def test_get_settings_reads_individually_set_environment_variables(
    monkeypatch, env_variables
):
    initial_config = src.config.get_settings()

    for cur_key, cur_val in env_variables.items():
        initial_value = getattr(initial_config, cur_key)
        with monkeypatch.context() as patch:
            patch.setenv(cur_key.upper(), cur_val)
            reload(src.config)

            config = src.config.get_settings()
            config_value = getattr(config, cur_key)

            assert initial_value != config_value
            assert cur_val == config_value

            variables_not_modified = (env for env in env_variables if env != cur_key)

            for key in variables_not_modified:
                value = getattr(config, key)
                assert value != env_variables.get(key)
                assert value == getattr(initial_config, key)
