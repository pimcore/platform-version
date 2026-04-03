# Product Registration

Pimcore requires product registration before it can be installed or used.
This mechanism validates each Pimcore instance and ensures compliance with Pimcore licensing.

Product registration is mandatory. Without a valid product key, installation cannot proceed
and the Symfony container cannot be built (relevant for upgrades of existing installations).

## Instance Identification

Every Pimcore project instance must be registered individually.
Registration is based on an instance ID and the `pimcore.encryption.secret`, both generated during installation.
A `hash_hmac('sha256', $instanceIdentifier, $secret)` is used as the identifier for the registration process.
This ensures a unique identifier without leaking secret data.

The instance identifier must be unique across all Pimcore installations.
During installation, Pimcore generates a unique identifier automatically.
If you set the identifier manually (e.g. for automated deployments),
you must ensure it is unique and not reused across different Pimcore installations.

Different environments of an instance (development, staging, testing, production) can share the same product key,
as long as they share the same instance ID and encryption secret.

One product key must not be used for multiple Pimcore instances.

## Registration Process

Registration is a one-time process done via the [Pimcore Product Registration Form](https://license.pimcore.com/register).
Your Pimcore instance provides a deep link including the instance ID when asking for the product key.

Open the link, follow the instructions, generate a product key, and apply it to your instance.

## Adding the Product Key

### During Installation

During a fresh installation, the product key is required.
It can be entered manually via a prompt or passed via parameters or environment variables (for automated installations).

When installing manually, the prompt provides a deep link to the registration form including the instance ID.

When using parameters or environment variables,
make sure the encryption secret, instance ID, and product key match each other.

After installation, the encryption secret, instance ID, and product key are stored in
`config/local/product_registration.yaml`. For multi-stage deployments, it is recommended to use environment variables instead:

- `PIMCORE_PRODUCT_REGISTRATION_KEY` - the product key
- `PIMCORE_ENCRYPTION_SECRET` - the encryption secret

### During Upgrade or Manual Registration

If you are upgrading from an older Pimcore version (or if you have changed the encryption secret),
a product registration error will be thrown during container build.

Follow the registration link in the error message to generate a valid product key
and add it to the Symfony configuration as described above.

## Verification Logic

The product key is validated locally via private-public key validation.
It performs a signature verification and a check for matching instance ID.

The checks are performed:
- During installation of Pimcore.
- During the build of the Symfony container.

## FAQ

### Can I use one product key for multiple environments?

Yes, if they share the same instance ID and encryption secret.
For example, development, staging, and production environments of the same project can use one product key.

### Can I use one product key for multiple instances?

No. Each Pimcore instance requires its own product key.
An "instance" is identified by its unique combination of instance ID and encryption secret.

### How do I register in CI/automated pipelines?

Pass the encryption secret, instance ID, and product key to the installer using parameters or environment variables.
This enables reproducible, automated installations with static instance secrets and product keys.

### How do I re-register after changing the encryption secret?

Change the instance identifier in the Symfony configuration (`pimcore.product_registration.instance_identifier`),
rebuild the container, follow the link in the error message, generate a new product key,
and apply it to the configuration.

### Where is the product key stored?

In `config/local/product_registration.yaml`.
For multi-stage deployments, it is recommended to use environment variables instead.

### How do I generate an encryption secret manually?

Use the Defuse key generator included with Pimcore:

```bash
vendor/bin/generate-defuse-key
```
