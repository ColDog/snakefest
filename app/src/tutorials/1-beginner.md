### Basic Snake Tutorial

Welcome to the snakefest tutorial! You are on your way to becoming an expert
battlesnaker. Follow these tutorials to build up the basics of a snake and get
going faster than ever.

Now, let's get started with a simple example where we build a snake that will
only move to the left.

```javascript
function move(req) {
    console.log('Hi!')
    return 'left'
}
```

Now, click "Save" to publish our snake with this provided code and then click
"Play" above the game frame. We should see "Hi!" pop up in the logs in the
console below and our snake should move left and hit a wall.

We can now also hit "Replay" to re-watch the same game over again. Notice that
we won't see any new logs coming out of the snake, this is because the game is
being only replayed and we aren't calling out to your snake.

#### Random Snake

Now let's take the next step with our snake to build randomized logic into the
workflow.

First, let's write a random function which will return a fixed whole number
between two points.

```javascript
function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
```

**TIP:** If you are curious how this function will work, open up your console.
(ctrl+shift+j) and insert the function. You can call it, change parameters and
more to debug your code before inserting it into the pane.

We use two of the standard `Math` functions from javascript here, `floor` and
`random`. If you would like to learn more about some of the javascript standard
library utilities [MDN] is a great utility.

[MDN]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random

Now that we have a random function, we need to select a choice from the four
possible directions that we may travel in. First, let's declare these choices
somewhere near the top of our file so we can select a choice from our list.

```javascript
var choices = ['up', 'down', 'left', 'right'];
```

To select a direction with our random function, we need to use array indexing to
fetch a choice that we would like. For example: `choices[0]` will return "up"
and `choices[1]` will return "down". Try this out in your console. Note, to get
the last value in a list we can use `choices[choices.length - 1]`.

Now, let's put this together, with our new move function can select a choice
from the list and move in a random direction.

```javascript
function move(req) {
    var direction = choices[rand(0, choices.length - 1)];
    console.log('direction', direction);
    return direction;
}
```

Now let's hit save and try our snake out! Notice how the snake will move in
random directions as we hit save over and over again, this will cause the snake
to often hit the wall or maybe even hit itself. But congratulations! You've made
a basic battlesnake.

#### Deployment

Now, the next step. We need to take the code that we've built here and move this
into a format where we can deploy it to a service like AWS, Heroku or Zeit.

First step that we'll want to go through is cloning the node starter snake:

```bash
git clone https://github.com/battlesnakeio/starter-snake-node
```

Now, open up the README and follow the deployment instructions. Once your basic
snake is deployed, we now need to take the code in the middle panel and copy
this into a new file `snake.js`.

Now we export our `move` function at the bottom of the `snake.js` file by
adding:

```javascript
module.exports = { move: move }
```

Inside `index.js` we need to import our `snake.js` file by adding the
following near the top of the file.

```javascript
const snake = require('./snake.js')
```
Now can change the `/move` endpoint to return the needed move direction:

```javascript
  // Response data
  const data = {
    move: snake.move(request.body),
  }
```
