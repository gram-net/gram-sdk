if ! [ $(command -v rust) ]; then
  ec "Installing Rust"
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh || :
fi
echo "INFO: build utils (convert-address)..."
cd "${GRAMCORE}/etc/lib/convert-address"
cargo update
cargo build --release
cp "${GRAMCORE}/etc/lib/convert-address/target/release/convert_address" "${GRAMCORE}/etc/utils"
echo "INFO: build utils (convert_address)... DONE"
