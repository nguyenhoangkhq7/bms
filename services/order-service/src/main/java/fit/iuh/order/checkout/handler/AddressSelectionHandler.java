package fit.iuh.order.checkout.handler;

import fit.iuh.order.checkout.model.CheckoutContext;
import fit.iuh.order.exception.BadRequestException;
import fit.iuh.order.exception.NotFoundException;
import fit.iuh.order.shipping.model.ShippingAddress;
import fit.iuh.order.shipping.repository.ShippingAddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AddressSelectionHandler extends CheckoutHandler {
    private final ShippingAddressRepository shippingAddressRepository;

    @Override
    protected void process(CheckoutContext context) {
        if (context.getUserId() == null) {
            throw new BadRequestException("userId is required");
        }

        Long shippingAddressId = context.getShippingAddressId();
        if (shippingAddressId != null) {
            ShippingAddress selected = shippingAddressRepository.findByIdAndUserId(shippingAddressId, context.getUserId())
                .orElseThrow(() -> new NotFoundException("Shipping address not found for user"));
            applyAddress(context, selected);
            return;
        }

        boolean hasRawAddress = context.getShippingAddress() != null
            && !context.getShippingAddress().isBlank()
            && context.getShippingLatitude() != null
            && context.getShippingLongitude() != null;
        if (hasRawAddress) {
            context.setShippingAddress(context.getShippingAddress().trim());
            return;
        }

        ShippingAddress defaultAddress = shippingAddressRepository.findFirstByUserIdAndIsDefaultTrue(context.getUserId())
            .orElseThrow(() -> new BadRequestException("No shipping address provided and no default address found"));
        applyAddress(context, defaultAddress);
    }

    private void applyAddress(CheckoutContext context, ShippingAddress address) {
        context.setShippingAddressId(address.getId());
        context.setShippingAddress(address.getRecipientName() + ", " + address.getPhoneNumber() + ", " + address.getAddressLine());
        context.setShippingLatitude(address.getLatitude());
        context.setShippingLongitude(address.getLongitude());
    }
}
