import os
import subprocess
import sys


def run_command(cmd):
    """Run a command and return its output or an error message."""
    try:
        result = subprocess.run(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=True
        )
        return result.stdout.strip()
    except Exception as exc:
        return f"Error running {' '.join(cmd)}: {exc}"


def main():
    print("== Python Version ==")
    print(sys.version)
    print()

    print("== Installed Packages ==")
    print(run_command(["pip", "freeze"]))
    print()

    print("== Node Version ==")
    print(run_command(["node", "--version"]))
    print()

    print("== npm Version ==")
    print(run_command(["npm", "--version"]))
    print()

    env_vars = ["CORS_ALLOW_ORIGINS", "CORS_ALLOW_METHODS", "CORS_ALLOW_HEADERS"]
    print("== Environment Variables ==")
    for var in env_vars:
        print(f"{var}={os.getenv(var, '')}")


if __name__ == "__main__":
    main()
