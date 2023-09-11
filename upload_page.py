import os
import subprocess


def deploy_to_github_pages(repo_url):
    # Step 1: Initialize the repository (if not initialized)
    if not os.path.exists(".git"):
        subprocess.run(["git", "init"])

    # Step 2: Add all changes to the staging area
    subprocess.run(["git", "add", "."])

    # Step 3: Create a commit
    message = "Automatically generated commit for deployment to GitHub Pages"
    subprocess.run(["git", "commit", "-m", message])

    # Step 4: Set up the remote repository (if necessary)
    remote_urls = subprocess.check_output(["git", "remote", "-v"]).decode()
    if repo_url not in remote_urls:
        subprocess.run(["git", "remote", "add", "origin", repo_url])

    # Step 5: Push the code to the repository
    subprocess.run(["git", "push", "-u", "origin", "master"])

    # Step 6: Set the branch as a source for GitHub Pages
    # Note: This step assumes you are using the 'master' branch for GitHub Pages. If you use another flow, like the 'gh-pages' branch, you need to adjust it.
    # In this script, this step is just illustrative and you'd need to set it up manually for the first time or use the GitHub API.

    print(
        "Deployment completed! Remember to set the correct branch for GitHub Pages through the GitHub interface."
    )


if __name__ == "__main__":
    # Change the following URL to your repository's
    repo_url = "https://github.com/USERNAME/REPOSITORY_NAME.git"
    deploy_to_github_pages(repo_url)
