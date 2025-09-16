function requireLogin(request, response, next){
    if(!request.session.userId){
        return response.status(401).json({
            success: false,
            message: "Unauthorised"
        });
    }
    next();
}

module.exports = requireLogin;
