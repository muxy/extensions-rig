/* global require, process */
const readline = require('readline');
const https = require('http');

//--------------------------------------------------------
// Set this to your testing Twitch channel ID before running:
const CHANNEL_ID = '';
//--------------------------------------------------------

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Constant setup
const PLAYER = 1;
const TWITCH = -1;
const PIG_GAME = -2;
const NO_PLAYER = 0;

// Default settings for the application.
const HOST = 'sandbox.api.muxy.io';
const EXTID = '1ssqhiy6xaoyisxbtvkiusxtjzkof2';

// turn sets up the turn structure of the tic-tac-toe game.
function turn(player, tk, gameboard) {
  render(gameboard);

  // Set the state so that latecomers to the stream can see the correct state of the game
  // when they load in.
  request(
    'POST',
    '/v1/e/channel_state',
    tk,
    {
      board: gameboard,
      player
    },
    () => {
      // Broadcast a render request so that current viewers can see the game as up-to-date
      // as possible. There is no reason to wait for this to complete before querying for
      // inputs, so no callback is attached.
      request('POST', '/v1/e/broadcast', tk, {
        target: 'broadcast',
        event: 'render',
        user_id: CHANNEL_ID,
        data: {
          board: gameboard,
          player
        }
      });

      // Get the input from the current player. Input returns an integer 1-9, while the
      // game state is stored in a zero-indexed array.
      input(player, tk, gameboard, (val) => {
        const i = val - 1;

        // Play the move, check for winners, and display a message if a winner exists.
        gameboard[i] = player;
        const winner = win(gameboard);
        if (winner !== NO_PLAYER) {
          let message = `${winner === PLAYER ? 'PLAYER' : 'TWITCH'} WINNER WINNER CHICKEN DINNER`;
          if (winner === PIG_GAME) {
            message = 'THERES NO CLEVER RHYME FOR A TIE DINNER';
            return;
          }

          render(gameboard);
          console.log(message);

          // Again, setting the state and then notifying the users of the state change.
          request('POST', '/v1/e/channel_state', tk, {
            board: gameboard,
            player,
            winner,
            message
          });

          request('POST', '/v1/e/broadcast', tk, {
            target: 'broadcast',
            event: 'winner',
            user_id: CHANNEL_ID,
            data: {
              board: gameboard,
              player,
              winner,
              message
            }
          });
        } else {
          turn(nextPlayer(player), tk, gameboard);
        }
      });
    }
  );
}

function input(player, tk, board, callback) {
  if (player === PLAYER) {
    // If we're waiting on a player move, just use readline to get console input.
    rl.question('Select a place to play (1-9) ', (place) => {
      const ind = parseInt(place, 10);
      if (ind < 1 || ind > 9) {
        return input(player, tk, board, callback);
      }

      if (board[ind - 1] !== NO_PLAYER) {
        return input(player, tk, board, callback);
      }

      return callback(ind);
    });
  } else if (player === TWITCH) {
    console.log('Waiting for twitch to make their choice...');
    // Broadcast a message to show that its time for twitch to make their move
    request(
      'POST',
      '/v1/e/broadcast',
      tk,
      {
        target: 'broadcast',
        event: 'make_choice',
        user_id: CHANNEL_ID,
        data: {}
      },
      () => {
        const now = Math.floor(Date.now());
        console.log('Waiting 30 seconds for accumulate results...');
        // Wait for 30s for twitch to make their move, retrying on no clicks.
        setTimeout(() => {
          request('GET', `/v1/e/accumulate?id=move&start=${now}`, tk, null, (accResponse) => {
            // The accumulate response is a json object, with a data array that holds the
            // information about each call to accumulate from the client-side.
            // The data object has the user_id, opaque_user_id, a timestamp and the
            // json blob passed into accumulate. For this example,
            // we only need to use the data blob and opaque_user_id fields.

            accResponse = JSON.parse(accResponse);
            if (accResponse.data.length === 0) {
              // Keep waiting on no input.
              return input(player, tk, board, callback);
            }

            // Unique on users
            const uservote = {};
            for (let i = 0; i < accResponse.data.length; i += 1) {
              const entry = accResponse.data[i];
              uservote[entry.opaque_user_id] = entry.data.value;
            }

            // Compute the ordering of the most popular choices.
            const votes = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (const k in uservote) {
              const choice = uservote[k];
              if (choice > 0 && choice <= 9) {
                votes[choice - 1] += 1;
              }
            }

            console.log(
              `Twitch made ${accResponse.data.length} clicks over ${Object.keys(uservote)
                .length} unique users.`
            );
            console.log(`Vote values are ${votes.join(',')}`);

            // Helper function to determine max index of a value in an array.
            const maxIndex = function (arr) {
              let ind = -1;
              let max = 0;
              for (let i = 0; i < arr.length; i += 1) {
                if (arr[i] > max) {
                  ind = i;
                  max = arr[i];
                }
              }

              return ind;
            };

            // Try to play the most popular move. If it is impossible due to game state,
            // then play the next most popular move. If no valid move got the vote, then
            // kick it back to voting.
            while (true) {
              const index = maxIndex(votes);
              // No move that was voted for was valid, kick it back to request input again.
              if (index === -1) {
                return input(player, tk, board, callback);
              }

              if (board[index] === NO_PLAYER) {
                return callback(index + 1);
              }
              // Sets up the voting counter so that the next most popular option is selected
              // in the next iteration.
              votes[index] = 0;
            }
          });
        }, 1000 * 30);
      }
    );
  }
}

(function setup() {
  if (!CHANNEL_ID) {
    console.log("You need to set your channel's id at the top of this file.");
    process.exit();
  }

  // This would be a token computation in the real api.
  // The required claims are 'role': 'backend',
  // and valid channel_id, user_id values.
  const req = https.request(
    {
      host: HOST,
      path: '/v1/e/authtoken',
      method: 'POST'
    },
    (resp) => {
      let chunk = '';
      resp.on('data', (ch) => {
        chunk += ch;
      });
      resp.on('end', () => {
        const token = JSON.parse(chunk).token;
        game(token);
      });
    }
  );

  req.write(
    JSON.stringify({
      app_id: EXTID,
      channel_id: CHANNEL_ID,
      user_id: CHANNEL_ID,
      role: 'backend'
    })
  );

  req.end();
}());

function game(token) {
  const player = PLAYER;
  const gameboard = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  turn(player, token, gameboard);
}

// Request makes a signed request to the muxy API.
function request(method, endpoint, tk, bodyobj, callback) {
  const req = https.request(
    {
      host: HOST,
      path: endpoint,
      method,
      headers: {
        Authorization: `${EXTID} ${tk}`
      }
    },
    (resp) => {
      let body = '';
      resp.on('data', (ch) => {
        body += ch;
      });
      resp.on('end', () => {
        if (callback) {
          callback(body);
        }
      });
    }
  );

  if (bodyobj) {
    req.write(JSON.stringify(bodyobj));
  }

  req.end();
}

// Implementation of tic-tac-toe
function win(gb) {
  for (let j = 0; j < 3; j += 1) {
    let sum = 0;
    for (let k = 0; k < 3; k += 1) {
      sum += gb[j * 3 + k];
    }
    if (sum === PLAYER * 3) {
      return PLAYER;
    }
    if (sum === TWITCH * 3) {
      return TWITCH;
    }

    sum = 0;
    for (let k = 0; k < 3; k += 1) {
      sum += gb[k * 3 + j];
    }
    if (sum === PLAYER * 3) {
      return PLAYER;
    }
    if (sum === TWITCH * 3) {
      return TWITCH;
    }
  }

  let sum = gb[0] + gb[4] + gb[8];
  if (sum === PLAYER * 3) {
    return PLAYER;
  }
  if (sum === TWITCH * 3) {
    return TWITCH;
  }

  sum = gb[2] + gb[4] + gb[6];
  if (sum === PLAYER * 3) {
    return PLAYER;
  }
  if (sum === TWITCH * 3) {
    return TWITCH;
  }

  for (let j = 0; j < 9; j += 1) {
    if (gb[j] === NO_PLAYER) {
      return NO_PLAYER;
    }
  }

  return PIG_GAME;
}

function nextPlayer(p) {
  if (p === PLAYER) {
    return TWITCH;
  }
  return PLAYER;
}

function glyph(gb, i) {
  // ANSI Color output
  switch (gb[i]) {
    case PLAYER:
      return '\u001B[0;32mX\u001B[0m';
    case TWITCH:
      return '\u001B[0;35mO\u001B[0m';
    default:
      return `\u001B[30;1m${i + 1}\u001B[0m`;
  }
}

function render(g) {
  console.log(`${glyph(g, 0)} ${glyph(g, 1)} ${glyph(g, 2)}`);
  console.log(`${glyph(g, 3)} ${glyph(g, 4)} ${glyph(g, 5)}`);
  console.log(`${glyph(g, 6)} ${glyph(g, 7)} ${glyph(g, 8)}`);
}
