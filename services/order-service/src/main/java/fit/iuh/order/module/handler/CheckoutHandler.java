package fit.iuh.order.module.handler;

public abstract class CheckoutHandler {
    protected CheckoutHandler nextHandler;

    public CheckoutHandler setNextHandler(CheckoutHandler nextHandler) {
        this.nextHandler = nextHandler;
        return nextHandler;
    }

    public void handle(CheckoutContext context) {
        process(context);
        if (nextHandler != null) {
            nextHandler.handle(context);
        }
    }

    protected abstract void process(CheckoutContext context);
}
