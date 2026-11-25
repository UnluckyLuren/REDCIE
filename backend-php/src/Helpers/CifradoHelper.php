<?php
declare(strict_types=1);

namespace RedUdeg\Helpers;

/**
 * Utilería para cifrado simétrico autenticado usando AES-256-GCM.
 */
final class CifradoHelper
{
    private const ALGORITMO = 'aes-256-gcm';

    public static function cifrar(string $textoPlano): string
    {
        $clave = self::obtenerClave();
        $iv = random_bytes(openssl_cipher_iv_length(self::ALGORITMO));
        $etiqueta = '';

        $textoCifrado = openssl_encrypt(
            $textoPlano,
            self::ALGORITMO,
            $clave,
            OPENSSL_RAW_DATA,
            $iv,
            $etiqueta
        );

        if ($textoCifrado === false) {
            throw new \RuntimeException('Fallo al cifrar los datos.');
        }

        return base64_encode($iv . $etiqueta . $textoCifrado);
    }

    public static function descifrar(string $datosCodificados): string|false
    {
        $clave = self::obtenerClave();
        $datos = base64_decode($datosCodificados);
        $longitudIv = openssl_cipher_iv_length(self::ALGORITMO);

        if (strlen($datos) < $longitudIv + 16) {
            return false;
        }

        $iv = substr($datos, 0, $longitudIv);
        $etiqueta = substr($datos, $longitudIv, 16);
        $textoCifrado = substr($datos, $longitudIv + 16);

        return openssl_decrypt(
            $textoCifrado,
            self::ALGORITMO,
            $clave,
            OPENSSL_RAW_DATA,
            $iv,
            $etiqueta
        );
    }

    private static function obtenerClave(): string
    {
        $clave = $_ENV['APP_CLAVE_SECRETA'] ?? '';
        if (strlen($clave) < 32) {
            throw new \RuntimeException('APP_CLAVE_SECRETA debe tener al menos 32 caracteres.');
        }
        return substr($clave, 0, 32);
    }
}
