class HomeController{

    async index(req, res){
        res.send("APP EXPRESS! - Guia do programador");
    }

    async validade (req, res) {
        res.send("Okay");
    }

}

module.exports = new HomeController();