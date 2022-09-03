var User = require("../models/User");
var PasswordToken = require("../models/PasswordToken");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");

var secret = "hsaushaushauhsa";



class  UserController {

    async index (req, res){
        var users = await User.findAll();
        res.json(users);
    }

    async findUser(req, res){
        var id = req.params.id;
        var user = await User.findById(id);

        if (user == undefined){
            res.status(404);
            res.json({});
        }else{
            //res.status(200);
            res.json(user);
        }
    }

    async create (req, res){

        var {email, name, password} = req.body;

        if (email == undefined || email == '' || email == ' '){
            res.status(400);
            res.json({err: "O e-mail é inválido."});
            return;
        }

        //verificar se existe email
        var emailExists = await User.findEmail(email);   

        if (emailExists){
            res.status(406);
            res.json({err: "O e-mail já está cadastrado."});  
            return;
        }

        await User.new(email, password, name);

        res.status(200);
        res.send("Tudo Ok.");
        

        console.log(req.body);
        res.send("Pegando o corpo da requisição.");
    }

    async edit (req, res){
       var {id, email,name, role} = req.body; 
       var result = await User.update(id, email,name, role);

       if (result != undefined){
           if (result.status){
               res.status(200);
               res.send("Tudo Ok.");
           }else{
               res.status(406);
               res.send(result.error);
           }
       }else{
            res.status(406);
            res.send("Ocorreu um erro na atualização.");
       }
    }
    async delete (req, res){
       var id = req.params.id;
       
       var result = await User.delete(id);

       if (result.status){
            res.status(200);
            res.send("Tudo OK.");
       }else{
            res.status(406);
            res.send(result.error);
       }
    }

    async recoverPassword( req, res){
        var email = req.body.email;
        var result = await PasswordToken.create(email);

        if(result.status){
            res.status(200);
            res.send("" + result.token);
        }else{
            res.status(406);
            res.send(result.error);

        }
        
    }

    async changePassword( req, res){
        var token    = req.body.token;
        var password = req.body.password;

        var isTokenValid = await PasswordToken.validade(token);

        if (isTokenValid){

            try {
                var result = await User.changePassoword(password,isTokenValid.token.user_id,isTokenValid.token.token);
            
                if (result != undefined){
                    res.status(200);
                    res.send("Senha alterada.");
                }else{
                    res.status(406);
                    res.send("Token invalido.");     
                }

            } catch (error) {
                res.status(406);
                res.send("Token invalido.");  
            }
           

        }else{
            res.status(406);
            res.send("Token invalido.");
        }
    }

    async login (req, res){
        var {email, password} = req.body;

        var user = await User.findByEmail(email);

        if (user != undefined){

           var result = await bcrypt.compare(password,user.password);

           if (result){

                //criar o token
                var token = jwt.sign({ email: user.email, role: user.role }, secret);

                res.status(200);
                res.json({token : token});

           }else{
             res.status(406);             
             res.json({err: "Senha incorreta"});
             
           }  
           
        }else{
            res.status(406);
            res.json({status: false, err: "Usuário não encontrado"});

        }
    }

}

module.exports = new UserController();
