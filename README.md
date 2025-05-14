# Touch Rugby Play Learner

A 3D game to help learn touch rugby plays, built with three.js.

## How to Run

1. **Clone or Download:** Get all the project files onto your local machine.
2. **Serve the Files:** Due to browser security restrictions, you need to serve the files using a local web server. There are several options:
   - Use the Live Server extension in VS Code
   - Run `python -m http.server` in the project directory (if Python is installed)
   - Use any other local development server (Node.js http-server, etc.)
3. **Open in Browser:** Navigate to the local server URL (typically http://localhost:8000 or similar)

## Game Features

- **3D Rugby Pitch** with 6-player teams
- **Player Movement Paths** with decision points
- **Play Designer** for coaches to create custom plays
- **Decision Training** to develop rugby play decision-making skills

## How to Play

### Practice Mode

1. Click "Start Practice" from the main menu
2. Watch as the players execute their moves
3. When a player reaches a decision point, you'll be prompted to choose the correct action
4. Make the right choice to continue the play, or try again if you get it wrong
5. Your score increases with each correct decision

### Play Designer

1. Click "Design New Play" from the main menu
2. Click on a player to select them (they'll turn green)
3. Click on the pitch to add movement points for the selected player
4. Hold Shift while clicking to add a decision point (appears in purple)
5. Press 'P' to preview the movement of the selected player
6. Press 'Delete' or 'Backspace' to clear the current player's path
7. Press 'Escape' to exit the designer and return to the main menu

## Controls

- **Mouse Click:** Select players, add path points
- **Shift + Click:** Add decision points
- **P:** Preview selected player's movement
- **Delete/Backspace:** Clear selected player's path
- **Escape:** Exit designer mode/return to menu

## Project Structure

- `index.html`: Main HTML file
- `style.css`: All game styling
- `js/`: JavaScript files
  - `main.js`: Main entry point, sets up three.js scene
  - `Pitch.js`: Creates the rugby pitch
  - `Player.js`: Player model and movement logic
  - `Ball.js`: Rugby ball model
  - `Team.js`: Team management
  - `Game.js`: Main game logic
  - `PlayDesigner.js`: Play designer interface
