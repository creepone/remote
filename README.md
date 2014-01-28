remote
======

##### Remote control your PC(s) using a web interface. 

Each PC acts as a slave that implements commands (nodejs scripts in a certain form).
It connects to the server using a web socket and listens for the commands to be executed.

Using the web interface, one can see the list of currently connected slaves, execute commands and check the status of previously executed commands.

*TODO: how to setup the web server*

### How to implement commands
Each slave can implement one or more commands. A command is implemented in a node script (located under `slave/commands`), exporting the following interface:
```
function CookMeDinnerCommand(args) {
    this.args = args;
}

CookMeDinnerCommand.prototype.name = "CookMeDinner";

CookMeDinnerCommand.prototype.execute = function () {
    // cook the dinner using this.args
};

module.exports = CookMeDinnerCommand;
```
The constructor `args` can contain any arguments specific to the command implementation. The `execute` function should return a Q promise, resolved when the execution has been completed successfully or rejected if the command fails at any point. Then `name` is used to identify the command in the calling code and should be unique within one slave (though multiple slaves might implement the same command).

*TODO: how to setup the slave (forever etc.)*