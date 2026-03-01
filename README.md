<h1 align="center">
  <br>
  Minecraft Bedrock Debugger
  <br>
</h1>

<h4 align="center">Debug your JavaScript or TypeScript code running in Minecraft Bedrock, from NOT Visual Studio Code.</h4>

### :fire: Features in Neovim vs Vscode

The plugin was patched to work anywhere, albeit at the cost of several features

| Feature                  | Neovim | VS Code |
| ------------------------ | :----: | :-----: |
| Breakpoints              |   ✓    |    ✓    |
| Step Through Code        |   ✓    |    ✓    |
| Locals / Scopes Panel    |   ✓    |    ✓    |
| Watches                  |   ✓    |    ✓    |
| Change Variable State    |   ✓    |    ✗    |
| Immediate Mode (REPL)    |   ✓    |    ✗    |
| Performance Diagnostics  |   ✗    |    ✓    |
| Minecraft Slash Commands |   ✗    |    ✓    |

### :rocket: Getting Started

clone the repository then run:

```
npm install
npm run compile
```

---

## :zap: For debugging Minecraft Bedrock client inside Neovim

To use debugger capabilities, you'll want to install the nvim-dap within Neovim.

Minimal example config with [lazy.nvim](https://github.com/folke/lazy.nvim),
Switch out `args[0]` with the location of your build

```lua
  return {
    "mfussenegger/nvim-dap",
    config = function()
      local dap = require('dap')

      dap.adapters['minecraft-js'] = {
        type = "executable",
        command = "node",
        args = { "path/to/build/minecraft-debugger/dist/adapter.js" },
      }

      -- snippet to output logs outside of repl
      dap.listeners.before['event_output']['mc_dap'] = function(_, body)
        if body.category == "stdout" then
          if body.output:match("\n$") then
            vim.notify(body.output:sub(1, -2))
          else
            vim.notify(body.output)
          end
        end
      end
    end
  }
```

### :stop_sign: Ensure that the Minecraft Bedrock client can make "loopback" requests

If you want to connect Minecraft Bedrock client to your editor running on the same machine (this is the most common scenario), you will need to exempt the Minecraft client from UWP loopback restrictions. To do this, run the following from a command prompt or the Start | Run app.

Minecraft Bedrock:

```powershell
CheckNetIsolation.exe LoopbackExempt -a -p=S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436
```

Minecraft Bedrock Preview:

```powershell
CheckNetIsolation.exe LoopbackExempt -a -p=S-1-15-2-424268864-5579737-879501358-346833251-474568803-887069379-4040235476
```

### :zap: Prepare Neovim for a connection

To debug with Minecraft Bedrock, you'll need to connect from Minecraft and into your editor. This set of steps assumes you are debugging on the same Windows machine that you are running Minecraft from, but you can also debug across machines and across clients if you want to. If you are debugging across devices, you may need to open up a port within your firewall on the machine that you are running your editor within.

You'll want to configure your editor to know how to connect to Minecraft. If you're using a sample project such as the TS starter [minecraft-scripting-samples/ts-starter](https://github.com/microsoft/minecraft-scripting-samples/tree/main/ts-starter), this .vscode/launch.json file is already configured for you. But if you're creating a project from scratch, follow these instructions:

At the root of the behavior pack you want to debug, add a `.vscode` subfolder. Add the following launch.json file into that `.vscode` folder.

If your source is in JavaScript and you are developing directly against that source (you do not use a script build process), you'll want to configure `launch.json` as follows:

```json
{
    "version": "0.3.0",
    "configurations": [
        {
            "type": "minecraft-js",
            "request": "attach",
            "name": "Debug with Minecraft",
            "mode": "listen",
            "preLaunchTask": "build",
            "targetModuleUuid": "7c7e693f-99f4-41a9-95e0-1f57b37e1e12",
            "localRoot": "${workspaceFolder}/",
            "port": 19144
        }
    ]
}
```

`localRoot` should point at the folder which contains your behavior pack with script within it.
Port 19144 is the default networking port for Minecraft Script Debugging.

In the example above, `targetModuleUuid` is an optional parameter that specifies the identifier of your script module, which is located in your behavior pack's `manifest.json` file. This is important to use if you are developing add-ons in Minecraft while there are multiple behavior packs with script active.

If your source is in a language like TypeScript that generates JavaScript for Minecraft, you will want to use `sourceMapRoot` and `generatedSourceRoot` parameters in `launch.json`:

```json
{
    "version": "0.3.0",
    "configurations": [
        {
            "type": "minecraft-js",
            "request": "attach",
            "name": "Debug with Minecraft",
            "mode": "listen",
            "preLaunchTask": "build",
            "targetModuleUuid": "7c7e693f-99f4-41a9-95e0-1f57b37e1e12",
            "sourceMapRoot": "${workspaceFolder}/dist/debug/",
            "generatedSourceRoot": "${workspaceFolder}/dist/scripts/",
            "port": 19144
        }
    ]
}
```

Note that `generatedSourceRoot` should point at a folder where your generated JavaScript files (\*.js) are stored - for example, the outputs of a TypeScript build process. `sourceMapRoot` should point at a folder where you have source map files - typically created during your build process - that tie your generated JavaScript source files back to your potential TypeScript source.

### :telephone_receiver: Run your Minecraft Behavior Pack

Now that you've prepared Neovim and prepared your behavior pack, you're ready to start debugging!

Within Neovim cd into your project directory and use `:DapNew` or `:DapContinue` to start debugging. This will place the DAP into "Listen Mode", where it awaits a connection from Minecraft.

Start Minecraft and load into a world with your scripting behavior pack.

Use this slash command to connect to the DAP:

`script debugger connect`

You should see a "Debugger connected to host" response from this command if the connection is successful.

You can set breakpoints in your code with `:DapToggleBreakpoint`, on specific lines of code. As you run the tests in the behavior pack, your breakpoints will be hit. You can also view local variables and add watches as necessary (maybe).

---

## :phone: Debugging with Minecraft Bedrock Dedicated Server

> [!CAUTION]
> This feature is highly expected to work but has not yet been tested.

The procedure for debugging with Bedrock Dedicated Server is a little different. When debugging with Bedrock Dedicated Server, Bedrock Dedicated Server (not Neovim) will listen for debug connections initiated from Neovim.

#### :page_facing_up: Configure your Bedrock Dedicated Server

By default, Bedrock Dedicated Servers are not configured to allow debug connections. To enable this debugging, you'll need to change some settings within the `server.properties` file of your Bedrock Dedicated Server.

These settings configure debugging on Bedrock Dedicated Server:

- `allow-outbound-script-debugging` (true/false): enables the /script debugger connect command. Defaults to false.
- `allow-inbound-script-debugging` (true false): enables the /script debugger listen command (and the opening of ports on a server). Defaults to false.
- `force-inbound-debug-port` (number): Locks the inbound debug port to a particular port. This will set the default script debugging port and prevent a user of the /script debugger listen command from specifying an alternate port.

Within Bedrock Dedicated Server's console, use this slash command to start listening on a port:

`script debugger listen 19144`

You should see a "Debugger listening" response from this command.

Within Neovim, you'll want to configure your debug settings in `launch.json` to have Neovim connect to Dedicated Server. To do this, set "mode" to "connect".

```json
{
    "version": "0.3.0",
    "configurations": [
        {
            "type": "minecraft-js",
            "request": "attach",
            "name": "Debug with Minecraft",
            "mode": "connect",
            "preLaunchTask": "build",
            "sourceMapRoot": "${workspaceFolder}/dist/debug/",
            "generatedSourceRoot": "${workspaceFolder}/dist/scripts/",
            "port": 19144
        }
    ]
}
```
