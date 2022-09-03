var knex   = require("../database/connection");
var bcrypt = require("bcrypt");
const PasswordToken = require("./PasswordToken");

class User{

    //método para listar TODOS usuarios.
    async findAll(){
        try {
            var result = await knex.select(["id","email","role", "name"]).table("users");
            return result;
        } catch (error) {
            console.log(error);
            return [];//array vazio.
        }
    }    
    //método para listar 1 usuarios.
    async findById(id){
        try {
            var result = await knex.select(["id","email","role", "name"]).where({id:id}).table("users");

            
           if (result.length > 0) {
             return result[0];
           }else{
                return undefined;
           }
        } catch (error) {
            console.log(error);
            return undefined;//array vazio.
        }
    }

    async findByEmail(email){
        try {
            var result = await knex.select(["id","email","password","role", "name"]).where ({email:email}).table("users");

           if (result.length > 0) {
                return result[0];
           }else{
                return undefined;
           }
        } catch (error) {
            console.log(error);
            return undefined;//array vazio.
        }
    }

    async new (email, password,name){
        try {

            var hash = await bcrypt.hash(password, 10);

            await knex.insert({email, password: hash,name, role: 0}).table("users");

        } catch (error) {
            console.log(error);   
        }
    }

    //verificar se está cadastrado no banco.
    async findEmail (email){
        try {
            var result = await knex.select("*").from ("users").where({email:email});

            //testar o array de retorno.
            if (result.length > 0){
                return true;
            }else{
                return false;
            }
            
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    //alterar
    async update (id, email, name, role){

        var user = await this.findById(id);
        
        if (user != undefined){

            var editUser = {};

            if (email != undefined){
                if (email != user.email){
                    var result = await this.findEmail(email);
                    if (!result){
                        editUser.email =  email;
                    }else{
                        return {status: false, error: "E-mail já está cadastrado"};
                    }
                }
            }

            if (name != undefined){
                editUser.name =  name;
            }

            if (role != undefined){
                editUser.role =  role;
            }

            try {
                await knex.update(editUser).where ({id: id}).table("users");  
                return {status: true};              
            } catch (error) {
                return {status: false, error: error};
            }    
        }else{
            return {status: false, error: "O Usuário não existe!"};
        }
    }

    //deletar
    async delete (id){
        var result = await this.findById(id);

        if (result != undefined){
            
            try {
                await knex.delete().where ({id: id}).table("users");  
                return {status: true};              
            } catch (error) {
                return {status: false, error: error};
            }    

        }else{
            return {status: false, error:"Usuário não existe."};
        }
    }    

    async changePassoword(newPassword, id, token){

        try {
            var hash = await bcrypt.hash(newPassword, 10);
            
            await knex.update({password : hash}).where({id: id}).table("users");

            await PasswordToken.setUsed(token);

        } catch (error) {
            console.log(error);   
        }

    }
} 

module.exports = new User();