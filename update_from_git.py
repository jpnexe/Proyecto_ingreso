import subprocess

def update_from_github():
    """
    Updates the local repository with the latest version from the remote repository.
    """
    try:
        # Execute the git pull command
        result = subprocess.run(["git", "pull"], capture_output=True, text=True, check=True)
        print("Successfully updated from GitHub.")
        print(result.stdout)
    except FileNotFoundError:
        print("Error: 'git' command not found. Make sure Git is installed and in your PATH.")
    except subprocess.CalledProcessError as e:
        print("Error updating from GitHub:")
        print(e.stderr)

if __name__ == "__main__":
    update_from_github()