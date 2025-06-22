
# README

**Polycheck Runner** is a VS Code extension that lets you right-click a file, open a side panel to enter “pre” and “post” condition files, and then runs a bundled binary on the original file. Output is shown in the panel.

## Requirements

-   Docker (for running the Polycheck binary)
    
-   Node.js (to build the extension)
    
-   VS Code with Extension Development setup
    

## Installation

1.  **Clone the repository:**
    
    ```bash
    git clone https://github.com/vaibhavsiingh/polycheck-runner
    cd polycheck-runner
    ```
    
2.  **Install dependencies and compile TypeScript:**
    
    ```bash
    npm install
    npm run compile
    ```
    
3.  **Run or package the extension:**
    
    -   To test in VS Code: Press `F5` to open an Extension Development Host.
        
        

## Usage

1.  Download and run the Polycheck Docker image:
    
    ```bash
    docker run -it -p 3000:3000 aliaume/polycheck-small:latest polycheck --web
    ```
    
2.  In the extension folder:
    
    ```bash
    npm run compile
    ```
    
3.  Press `F5` in VS Code to launch the Extension Development Host.
    
4.  Right-click on any file in the file explorer and select **Run Polycheck on the file**.
    
5.  In the side panel that appears, provide paths to the **precondition** and **postcondition** files and execute.
    

