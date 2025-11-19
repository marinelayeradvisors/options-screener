# GitHub Setup Instructions

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the details:
   - **Repository name**: `options-screener` (or your preferred name)
   - **Description**: "Marine Layer Advisors - Options Dashboard for Financial Advisors"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

## Step 2: Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/options-screener.git

# Rename the default branch to main (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## Alternative: Using SSH (if you have SSH keys set up)

```bash
git remote add origin git@github.com:YOUR_USERNAME/options-screener.git
git branch -M main
git push -u origin main
```

## Step 3: Verify

After pushing, refresh your GitHub repository page. You should see all your files!

## Future Updates

When you make changes and want to push them:

```bash
git add .
git commit -m "Your commit message describing the changes"
git push
```

## Refreshing Market Data

To get fresh market quotes, simply run:

```bash
python3 fetch_market_data.py
```

Or use the convenience script:

```bash
./scripts/refresh-data.sh
```

The script will update `public/market_data.json` with the latest data. Refresh your browser to see the updates!


