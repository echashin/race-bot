import { Injectable } from '@nestjs/common';
import { gql, request } from 'graphql-request';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../core/configs/env';
import { BookingDetails } from '../dto/booking-details.dto';
import * as jwt from 'jsonwebtoken';
import { getUnixTime } from 'date-fns';

@Injectable()
export class GqlService {
  private url = 'https://billing.smartshell.gg/api/graphql';
  private accessToken: string | null = null;
  //id=>alias
  hosts: Record<number, string> = {};

  constructor(private readonly configService: ConfigService<EnvConfig>) {}

  async login() {
    if (this.accessToken) {
      const data: {
        company_id: string;
        expires: number;
        issued: number;
        refresh_token: number;
      } = jwt.decode(this.accessToken);

      const endDate = data.issued + data.expires;
      if (endDate > getUnixTime(new Date())) {
        return;
      }
    }

    const document = gql`
      mutation login {
        login(
          input: {
            login: "${this.configService.get('LOGIN')}"
            password: "${this.configService.get('PASSWORD')}"
            company_id: ${this.configService.get('APP_ID')}
          }
        ) {
          access_token
        }
      }
    `;
    try {
      const result: { login: { access_token } } = await request(
        this.url,
        document,
      );
      this.accessToken = result.login.access_token;
    } catch (err) {
      console.error(err);
    }
  }

  async getHosts(): Promise<void> {
    const document = gql`
      query hosts {
        hostsOverview {
          id
          alias
        }
      }
    `;
    try {
      const result: { hostsOverview: { id: number; alias: string }[] } =
        await request(
          this.url,
          document,
          {},
          { authorization: 'Bearer ' + this.accessToken },
        );
      this.hosts = Object.fromEntries(
        result.hostsOverview.map((host: { id: number; alias: string }) => [
          host.id,
          host.alias,
        ]),
      );
    } catch (err) {
      console.error(err);
    }
  }

  async getBooking(id: number): Promise<BookingDetails> {
    const document = gql`
      query booking {
        getBooking(id: ${id}) {
          id
          hosts
          client {
            id
            nickname
            dob
            roles {
              alias
            }
            creator {
              id
            }
            login
            phone
            email
            phone_suffix
            country_code
            first_name
            last_name
            middle_name
            deposit
          }
          from
          to
          comment
          status
          startsIn
          group
        }
      }
    `;
    const result: { getBooking: BookingDetails } = await request(
      this.url,
      document,
      {},
      { authorization: 'Bearer ' + this.accessToken },
    );
    return result.getBooking;
  }

  async getBookings(from: string, to: string): Promise<BookingDetails[]> {
    const hostIds: string[] = Object.keys(this.hosts);
    const document = gql`
      query bookings {
        getBookings(hostIds: [${hostIds.join(',')}],from: "${from}",to: "${to}") {
          data {
            id
          }
        }
      }
    `;
    try {
      const result: { getBookings: { data: { id: number }[] } } = await request(
        this.url,
        document,
        {},
        { authorization: 'Bearer ' + this.accessToken },
      );
      if (result.getBookings.data.length) {
        const promises = result.getBookings.data.map(
          ({ id }: { id: number; alias: string }) => this.getBooking(id),
        );
        return await Promise.all(promises);
      }
    } catch (err) {
      console.error(err);
    }
  }
}
