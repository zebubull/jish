const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Red, LightGray, OliveGreen, RGB }  = require('./colors');

console.clear();

let ctrlc = false;

const exit = (code) => {
    console.clear();
    process.exit(code);
}

const getPathFromCommand = (cmd) => {
    return path.join(process.cwd(), cmd.slice(1).join());
}

const leftPad = (string, length) => {
    while(string.length < length)
        string = ' ' + string;
    return string;
}

if (process.stdin.isTTY)
    process.stdin.setRawMode(true);

const commands = [
    'ls',
    'cd',
    'jish',
    'exit',
    'date',
    'time',
    'datetime',
];

const getInput = (prompt) => {
    process.stdout.write(OliveGreen(`${prompt}><> `));

    let buffer = Buffer(1);
    let str = '';
    const cstart = prompt.length + 4;

    let match = null;

    while (true)
    {
        fs.readSync(0, buffer, 0, 1);
        const value = buffer.readInt8();

        switch (value)
        {
            // Ctrl+C
            case 3:
                return null;
            // Backspace
            case 8:
                if (str.length == 0) continue;
                str = str.slice(0, -1);
                process.stdout.cursorTo(str.length + cstart);
                process.stdout.clearLine(1);
                continue;
            // Tab
            case 9:
                if (match)
                {
                    process.stdout.write(RGB(75) + match.slice(str.length));
                    str = match;
                }
                continue;
            // Enter
            case 0xd:
                process.stdout.write(RGB(75) + '\n');
                return str;
            default:
                process.stdout.write(RGB(75) + String.fromCharCode(value));
                str += String.fromCharCode(value);
                break;
        }

        if (str.indexOf(' ') == -1 && str.length > 0)
        {
            let found = false;
            for (let i = 0; i < commands.length; i++)
            {
                if (commands[i].indexOf(str) == 0)
                {
                    match = commands[i];
                    found = true;
                    break;
                }
            }

            if (!found) match = null;
        }
        else if (str.length > 0 && match)
        {
            if (str != match)
            {
                process.stdout.clearLine(1);
                match = null;
            }
        }

        if (match)
        {
            const to_write = match.slice(str.length);
            process.stdout.write(LightGray(to_write));
            process.stdout.moveCursor(-to_write.length);
        }
    }
}

while (true)
{
    const input = getInput(`${process.cwd()}`);
    let cmd = [null];
    if (input != null)
    {
        ctrlc = false;
        cmd = input.split(' ');
    }

    switch (cmd[0])
    {
        case 'exit':
            exit(0);
            break;

        case 'ls':
            let directory = process.cwd();
            if (cmd.length > 1) directory = getPathFromCommand(cmd);

            const contents = fs.readdirSync(directory);
            const l = contents.length;
            const stats = contents.map((file, _) => {
                return fs.lstatSync(file);
            });

            let biggest = 0;
            let longest = 0;

            for (let i = 0; i < l; i++)
            {
                if (stats[i].size > biggest) biggest = stats[i].size;
                if (contents[i].toString().length > longest) longest = contents[i].toString().length;
            }

            biggest = biggest.toString().length;

            process.stdout.write(` Type  ${leftPad('Size', biggest)} ${leftPad('Name', longest)}\n\n`);

            for (let i = 0; i < l; i++)
            {
                if (stats[i].isFile())
                    process.stdout.write(`[FILE] `);
                else
                    process.stdout.write(`[DIR]  `);

                process.stdout.write(leftPad(stats[i].size.toString(), biggest));
                process.stdout.write(` ${leftPad(contents[i], longest)}\n`);
            }
            break;

        case 'cd':
            const p = getPathFromCommand(cmd);
            if (!fs.existsSync(p))
            {
                console.log('Folder does not exist...');
            }
            else if (fs.lstatSync(p).isFile())
            {
                console.log('Cannot set current directory to a file...');
            }
            else
            {
                process.chdir(p);
            }
            break;
        
        case 'jish':
            console.log('JISH (JavascrIpt SHell) v0.1.0');
            console.log('It doesn\'t run javascript, it was just written in it');
            console.log('Inspired by FISH');
            console.log('Written by pixelatedCorn');
            break;

        case 'date':
            console.log(new Date().toLocaleDateString());
            break;

        case 'time':
            console.log(new Date().toLocaleTimeString());
            break;

        case 'datetime':
            console.log(new Date().toLocaleString());
            break;
        
        case null:
            if (ctrlc) 
                exit(0);
            ctrlc = true;
            console.log('Press CTRL+C again to exit...\n');
            break;
        
        default:
            console.log(`'${cmd[0]}' was not recognized as an operable command or executable file...\n`);
            break;
    }
}
