# Configuration de Twilio pour les notifications SMS

Ce guide vous explique comment configurer Twilio pour recevoir des notifications SMS lors de nouvelles commandes.

## 1. Création du compte Twilio

1. Allez sur [twilio.com](https://www.twilio.com) et créez un compte gratuit
2. Vérifiez votre numéro de téléphone et votre email
3. Une fois connecté, vous aurez accès à un crédit de test (environ $15-20)

## 2. Obtenir les identifiants Twilio

1. Dans le tableau de bord Twilio, allez dans "Account Info"
2. Notez les informations suivantes :
   - Account SID
   - Auth Token
   - Votre numéro Twilio (format: +1234567890)

## 3. Configuration des variables d'environnement

Fournissez les informations suivantes au développeur :

```env
NEXT_PUBLIC_TWILIO_ACCOUNT_SID=votre_account_sid
NEXT_PUBLIC_TWILIO_AUTH_TOKEN=votre_auth_token
NEXT_PUBLIC_TWILIO_PHONE_NUMBER=votre_numero_twilio
NEXT_PUBLIC_SHOP_PHONE=votre_numero_de_telephone
```

## 4. Test de la configuration

1. Le développeur testera l'envoi de SMS avec votre compte
2. Vous recevrez un SMS de test sur votre numéro de téléphone
3. Vérifiez que le message est bien reçu et lisible

## 5. Coûts et limites

- **Période d'essai** : Crédit gratuit de $15-20
- **Après la période d'essai** :
  - SMS sortants : ~$0.0075 par message
  - SMS entrants : ~$0.0075 par message
  - Estimation pour 10 commandes par jour : ~$2.25 par mois

## 6. Important à savoir

- Les SMS sont envoyés uniquement au propriétaire du magasin
- Le contenu du SMS inclut :
  - Nom du client
  - Date et heure de retrait
  - Montant total de la commande
- Les SMS sont envoyés en même temps que les emails de confirmation
- En cas de problème avec Twilio, les notifications par email continueront de fonctionner

## 7. Support

- Pour toute question sur Twilio : [support@twilio.com](mailto:support@twilio.com)
- Pour toute question sur l'implémentation : contactez le développeur
