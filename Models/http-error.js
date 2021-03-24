class HttpError extends Error{
    constructor(message, errorcode){
        super(message)
        this.code = errorCode
    }
}

module.exports = HttpError