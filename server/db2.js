const mysql=require('mysql')
const pool=mysql.createPool({
    host:'127.0.0.1',
    user:'root',
    password:'qwe15089586437zxc',
    database:'food',
    
})
function query2(sql,cb){
    pool.getConnection((err,connection)=>{
        if(err){
            throw err;
        }else{
            connection.query(sql,(err,result)=>{
                cb(err,result);
                connection.release()
            })
        }
    })
}
module.exports=query2;