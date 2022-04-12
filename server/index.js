const express = require('express');
const app = express();
const port = 3000;
const query = require('./db');
const query2 = require('./db2');
const multer = require('multer');
// var upload = multer({ dest: './public/images/' })
const path = require('path');
const mysql = require('mysql');
const { log } = require('console');
const bodyParser = require('body-parser');//post请求需要用到


app.use(bodyParser.json());//post请求需要用到

const client = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'qwe15089586437zxc',
    database: 'food',
})

//判断数据库是否连接成功
client.connect(function (err) {
    if (err) {
        console.log(err);
    }
    console.log('数据库连接成功');
})

app.use(express.static(path.join(__dirname, 'public')));

// app.use('/iamges',express.static(path.join(__dirname, '/images')));
// app.use(express.static(path.join(__dirname)));

app.use('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080"); //允许源访问，前端访问路径为“http://localhost:8080”
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "POST,GET,DELETE,OPTIONS");
    next();
});

app.listen(port, () => console.log(`Example app listening on port port!`));



//登录功能
app.post('/login', function (req, res, next) {
    // console.log(req.body.params);
    let usn = req.body.params.usn;
    let pwd = req.body.params.pwd;
    // console.log(pwd);
    let sql1 = 'select username from users where username = ?';//查询是否有该用户
    let sql2 = 'select username from users where username = ? and password = ?';//查询该用户的用户名和密码是否正确
    let sql3 = 'select username from users where username = ? and password = ? and status = ?';//查询是否管理员
    client.query(sql1, [usn],
        function (err, result) {
            if (err) {
                console.log(err);
            } else {
                if (result != '') {
                    client.query(sql2, [usn, pwd], function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (result != '') {

                                client.query(sql3, [usn, pwd, 1], function (err, result) {
                                    if (result != '') {
                                        res.json({ state: 'admin' })//管理员登录
                                    } else {
                                        res.json({ state: 'user' });//普通用户登录
                                    }
                                })
                            } else {
                                res.json({ state: 'mistake' });//密码错误情况
                            }
                        }
                    })
                } else {
                    res.json({ state: 'no' });//用户不存在情况
                }

            }
        })
    // let sql = `select * from users`;
    // const cd = function (err, result) {
    //     // console.log(result);
    //     // console.log(err)
    //     res.json(result);

    // };
    // query2(sql, cd)
})

//注册功能
app.post('/register', function (req, res, next) {
    // console.log(req.body.params);
    let name = req.body.params.usn;
    let pwd = req.body.params.pwd;
    client.query('select username from users where username = ?', [name], function (err, result) {
        if (result != '') {
            res.json({ type: 0 });
        } else {
            client.query('insert into users (username,password,status,assets) values (?,?,?,?)', [
                name, pwd, '0', 20], function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.json({ type: 1 });
                    }
                })

        }
    })

})
//菜品首页渲染
app.get('/home', function (req, res, next) {
    let sql = `select * from menu limit 8`;
    const cd = function (err, result) {
        // console.log(result);
        // console.log(err)
        res.json(result);
        // console.log(result)

    };
    query2(sql, cd)
})

//根据前端普通用户界面传来的id获取对应的菜品信息再返还给前端
app.get('/detail/:id', function (req, res, next) {
    client.query('select * from menu where id=?', [req.query.id], function (err, result) {
        res.json(result)
    })
    // console.log(req.query.id,'111');
})
//根据前端管理员界面传来的id获取对应的菜品信息再返还给前端
app.get('/admindetail/:id', function (req, res, next) {
    client.query('select * from menu where id=?', [req.query.id], function (err, result) {
        res.json(result)
    })
    // console.log(req.query.id,'111');
})

//添加菜品
app.get('/add', (req, res) => {
    let name = req.query.name;
    let url = req.query.picUrl;
    let price = parseInt(req.query.price);
    let ingredients = req.query.ingredients;
    let step = req.query.step;
    let kind = req.query.kind;
    // console.log(name,url,price,ingredients,step,kind);
    client.query('insert into menu (name,picUrl,price,ingredients,step,kind) values (?,?,?,?,?,?)', [
        name, url, price, ingredients, step, kind
    ], function (err, result) {
        if (err) {
            console.log(err);
        }
    })

})

//删除菜品
app.get('/delete/:id', (req, res) => {
    // console.log(req.query.id,'111');
    client.query('delete from menu where id = ?', [req.query.id],
        function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.json(result)
            }
        })
})

//收藏或者取消收藏菜品
app.get('/collect', (req, res) => {
    let query = req.query
    // console.log(query);
    client.query('insert into collect (menuId,menuName,menuUrl,username) values (?,?,?,?)', [
        query.menuId, query.menuName, query.menuUrl, query.username
    ], function (err, result) {
        if (err) {
            log(err)
        }
    })

})
//用户获取个人收藏订单
app.get('/collect/:user', (req, res) => {
    let query = req.query
    let username = JSON.parse(query.username);
    // log(query);
    client.query('select * from collect where username = ?', [username],
        function (err, result) {
            if (err) {
                log(err)
            } else {
                res.json(result)
            }
        })

})

app.get('/user/:name', function (req, res, next) {
    let name = req.query.name;
    // console.log(req.query);
    client.query('select * from users where username=?', [name], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result)
        }
    })
})
//用户下单
app.post('/place', function (req, res) {
    let body = req.body.params;
    // console.log(body.date);
    client.query('insert into menuorder (userId,username,phone,address,picUrl,name,date,issue,remarks,price) values (?,?,?,?,?,?,?,?,?,?)', [
        body.userId, body.username, body.phone, body.address, body.picUrl, body.menuName, body.date, 0, body.remarks, body.price
    ], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            // res.json(result);
            console.log(body.username + '下单成功!');
        }
    })
    //更新用户钱包
    client.query('update users set assets = ? where id = ?', [body.balance, body.userId],
        function (err, result) {
            if (err) {
                console.log(err);
            } else {
                // res.json(result)
                console.log('扣费成功!');
            }
        })
    client.query('select assets from users where username = ?', ['tao'], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            let wallet = result[0].assets;
            let income = wallet + body.price;
            // console.log(a+body.price);
            //管理员余额增加
            client.query('update users set assets = ? where username = ?', [income, 'tao'],
                function (err, result) {
                    if (err) {
                        console.log(err)
                    } else {
                        // res.json(result);
                    }
                })
        }
    })
})

//获取用户个人订单
app.get('/perOrder', function (req, res) {
    let username = req.query.username;
    // console.log(username);
    client.query('select * from menuorder where username = ?', [username], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result)
        }
    })
})

//菜品分类
app.get('/class', function (req, res) {
    let kind = req.query.kind;
    client.query('select * from menu where kind = ?', [kind],
        function (err, result) {
            if (err) {
                console.log(err)
            } else {
                res.json(result)
            }
        })
})

//菜品大全
app.get('/all', function (req, res) {
    //  console.log(req.query);
    let num = parseInt(req.query.num);
    let start = num;
    if (num > 1) {
        start = (num - 1) * 8 + 1
    }
    // console.log(start,end);
    //起启页，查询几条
    client.query(`select * from menu limit ${start - 1}, ${8}`, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result);
        }
    })
})

//编辑菜品
app.post('/edit', function (req, res) {
    let id = req.body.params.id
    let name = req.body.params.name;
    let url = req.body.params.picUrl;
    let price = parseInt(req.body.params.price);
    let ingredients = req.body.params.ingredients;
    let step = req.body.params.step;
    let kind = req.body.params.kind;
    // console.log(id);
    client.query('update menu set name=?,picUrl=?,price=?,ingredients=?,step=?,kind=? where id =?', [
        name, url, price, ingredients, step, kind, id
    ], function (err, result) {
        if (err) {
            console.log(err);
        }
    })
})

//管理员获取用户订单
app.get('/orderList', function (req, res) {
    let page = parseInt(req.query.page);
    let row = parseInt(req.query.row);
    let index = parseInt(req.query.index);
    // log(page, row, index)
    let start = page;
    if (start > 1) {
        start = (page - 1) * row + 1
    }
    if (index == 1) {
        client.query(`select * from menuorder where issue = 0  limit ${start - 1}, ${row}`, function (err, result) {
            if (err) {
                log(err)
            } else {
                //  log('111');
                res.json(result);
            }
        })
    }
    if (index == 2) {
        client.query(`select * from menuorder where issue = 1  limit ${start - 1}, ${row}`, function (err, result) {
            if (err) {
                log(err)
            } else {
                //  log('111');
                res.json(result);
            }
        })
    }
    if (index == 3) {
        client.query(`select * from menuorder limit ${start - 1}, ${row}`, function (err, result) {
            if (err) {
                log(err)
            } else {
                //  log('111');
                res.json(result);
            }
        })
    }

})

//管理员出单
app.post('/issue', function (req, res) {
    let id = req.body.params.id
    client.query('update menuorder set issue=? where id = ?', [
        1, id], function (err, result) {
            if (err) {
                log(err)
            } else {
                res.json({ type: 'success', id })
            }
        })
})
//按条件获取用户个人订单
app.get('/perOrder/:need', function (req, res) {
    let username = req.query.username;
    let index = req.query.val
    // console.log(index);
    // console.log(username);
    if (index == 1) {
        client.query('select * from menuorder where username = ? and issue = ?', [username, 0], function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.json(result)
            }
        })
    }
    if (index == 2) {
        client.query('select * from menuorder where username = ? and issue = ?', [username, 1], function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.json(result)
            }
        })
    }
    if (index == 3) {
        client.query('select * from menuorder where username = ?', [username], function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.json(result)
            }
        })
    }
})

//用户进入菜品详情页的收藏按钮显示
app.get('/collectType', function (req, res) {
    let username = req.query.name;
    let id = parseInt(req.query.id)
    //  console.log(username,id);
    client.query('select * from collect where menuId = ? and username = ?', [id, username],
        function (err, result) {
            if (err) {
                log(err)
            } else {
                // console.log(result);
                if (result != '') {
                    res.json({ type: true })
                }
            }
        })
})

//用户取消收藏
app.get('/uncollect', function (req, res) {
    let username = req.query.username;
    let id = parseInt(req.query.id)
    //  log(username,id)
    client.query('delete from collect where menuId = ? and username = ?', [
        id, username
    ], function (err, result) {
        if (err) {
            log(err)
        } else {
            res.json({ uncollect: true })
        }
    })
})

//用户评论
app.post('/comment', function (req, res) {
    let menuId = parseInt(req.body.params.menuId);
    let username = JSON.parse(req.body.params.username);
    let says = req.body.params.says;
    let date = req.body.params.date;
    //  log(menuId, username,says)
    client.query('insert into comment (menuId,username,says,date) values (?,?,?,?)', [
        menuId, username, says, date
    ], function (err, result) {
        if (err) {
            log(err)
        } else {
            res.json({ type: true })
        }
    })
})

//获取用户评论列表
app.get('/getComment', function (req, res) {
    let id = parseInt(req.query.id);
    //  console.log(id);
    client.query('select * from comment where menuId = ?', [id],
        function (err, result) {
            if (err) {
                log(err)
            } else {
                res.json(result)
            }
        })
})

//统计订单
app.get('/statement', function (req, res) {
    function getTime(date) {//把ISO时间转换为可读时间
        //时间转换
        var str = date.toString();
        str = str.replace("/-/g", "/");
        var oDate = new Date(str);
        return oDate;
    };
    //    console.log(req.query.val);
    let val = req.query.val
    client.query('select * from menuorder', function (err, result) {
        if (err) {
            log(err)
        } else {
            //    console.log(result[0]);
            if (val == 'day') {
                let dataArray = []
                for (let i = 0; i < result.length; i++) {
                    if (getTime(result[i].date).getFullYear() == new Date().getFullYear() && getTime(result[i].date).getMonth() == new Date().getMonth()
                        && getTime(result[i].date).getDate() == new Date().getDate()) {
                        //    res.json(result[i])
                        dataArray.push(result[i])
                    }
                }
                res.json(dataArray)
            }
            if (val == 'month') {
                let dataArray = []
                for (let i = 0; i < result.length; i++) {
                    if (getTime(result[i].date).getFullYear() == new Date().getFullYear() && getTime(result[i].date).getMonth() == new Date().getMonth()) {

                        dataArray.push(result[i])

                        //    log(result[i])
                    }
                }
               res.json(dataArray)
            }
            if (val == 'year') {
                let dataArray = []
                for (let i = 0; i < result.length; i++) {
                    if (getTime(result[i].date).getFullYear() == new Date().getFullYear()) {

                        dataArray.push(result[i])

                        //    log(result[i])
                    }
                }
               res.json(dataArray)
            }
           
        }

    })
})