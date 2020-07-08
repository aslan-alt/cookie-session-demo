const http = require('http');
const fs = require('fs')
const url = require('url')

http.createServer(function (request, response) {
    let sessionHash = JSON.parse(fs.readFileSync('./session.json').toString())

    const { pathname: path, query } = url.parse(request.url, true)
    if (path === '/') {
        let sessionList = request.headers['cookie'] && request.headers['cookie'].split(';') || null
        const id = sessionHash[sessionList[0].split('=')[1]]
        if (id) {
            let userDb = JSON.parse(fs.readFileSync('./db/userInfo.json').toString())
            const user = userDb.find(item => item.id === id)
            response.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' });
            response.write(fs.readFileSync('./public/index.html').toString().replace('{{user}}', `欢迎你，${user.name}`))
            response.end();
        } else {
            response.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' });
            response.write(fs.readFileSync('./public/index.html').toString().replace('{{user}}', `请登录`))
            response.end();
        }

    } else if (path === '/register') {
        response.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' });
        response.write(fs.readFileSync('./public/register.html'))
        response.end();
    } else if (path === '/doRegister') {
        let postData = ''
        request.on('data', (data) => {
            postData += data
        })
        request.on('end', () => {
            console.log(postData)
            postData = JSON.parse(postData)
            let userDb = JSON.parse(fs.readFileSync('./db/userInfo.json').toString())
            const id = (userDb[userDb.length - 1] && userDb[userDb.length - 1].id + 1) || 1
            userDb.push({ id, ...postData })
            fs.writeFileSync('./db/userInfo.json', JSON.stringify(userDb))
            response.statusCode = 200
            response.setHeader('content-Type', 'text/plain;charset=utf-8')
            // const sessionHash = JSON.parse(fs.readFileSync('./session.json').toString())//改到最上面一行
            const sessionId = 'myWeb' + Math.random()
            sessionHash[sessionId] = id
            fs.writeFileSync('./session.json', JSON.stringify(sessionHash))
            response.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly;`)
            response.write('成功')
            response.end()
        })
    } else if (path === '/login') {
        response.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' });
        response.write(fs.readFileSync('./public/login.html'))
        response.end();
    } else if (path === '/doLogin') {
        let postData = ''
        request.on('data', (data) => {
            postData += data
        })
        request.on('end', () => {
            postData = JSON.parse(postData)
            let userDb = JSON.parse(fs.readFileSync('./db/userInfo.json').toString())
            const user = userDb.find(item => item.name === postData.name && postData.password)
            if (user) {
                response.statusCode = 200
                response.setHeader('content-Type', 'text/plain;charset=utf-8')
                // const sessionHash = JSON.parse(fs.readFileSync('./session.json').toString())//改到请求进来第一行
                const sessionId = 'myWeb' + Math.random()
                sessionHash[sessionId] = user.id
                console.log(user)
                fs.writeFileSync('./session.json', JSON.stringify(sessionHash))
                response.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly;`)
                response.write('登陆成功')
                response.end()
            } else {
                response.statusCode = 402
                response.setHeader('content-Type', 'text/plain;charset=utf-8')
                response.write('账号密码错误')
                response.end()
            }

        })
    }
    else {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('not found');
    }

}).listen(8081);

console.log('Server running at http://127.0.0.1:8081/');