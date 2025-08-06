
interface UserData {
    fullName?: string,
    accountType?: AccountType[]
}

enum AccountType {
    client = 'client',
    freelancer = 'freelancer',
}

export type { UserData, AccountType }